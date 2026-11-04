import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { HeroFrameSequence } from '../types/hero'

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

/** Animate only the incoming section as it crosses the viewport boundary. */
export function useScrollFrames(sequence: Ref<HeroFrameSequence>, enabled: Ref<boolean>) {
  const scene = ref<HTMLElement | null>(null)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const ready = ref(false)
  const cache = new Map<number, HTMLImageElement>()
  const loading = new Set<number>()
  const failed = new Set<number>()
  let observer: ResizeObserver | undefined
  let motionPreference: MediaQueryList | undefined
  let frame = 0
  let target = 0
  let lastTarget = 0
  let revision = 0
  let disposed = false
  let needsMeasure = true
  let geometry = { top: 0, distance: 1 }

  function requestRender() {
    if (!frame && !disposed) frame = requestAnimationFrame(render)
  }

  function requestMeasure() {
    needsMeasure = true
    requestRender()
  }

  function loadFrame(index: number, priority: 'high' | 'low' = 'low') {
    if (index < 0 || index >= sequence.value.frameCount || cache.has(index) || loading.has(index) || failed.has(index)) return
    loading.add(index)
    const generation = revision
    const image = new Image()
    image.decoding = 'async'
    image.fetchPriority = priority
    image.onload = () => {
      if (disposed || revision !== generation) return
      loading.delete(index)
      cache.set(index, image)
      // Bound decoded image memory instead of retaining the whole video in RAM.
      while (cache.size > 20) {
        const furthest = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0]
        if (furthest === undefined) break
        cache.delete(furthest)
      }
      requestRender()
    }
    image.onerror = () => {
      if (disposed || revision !== generation) return
      loading.delete(index)
      failed.add(index)
    }
    image.src = `${sequence.value.basePath.replace(/\/$/, '')}/frame-${String(index).padStart(4, '0')}.jpg`
  }

  function focusAt(progress: number) {
    const points = sequence.value.focus
    if (!points?.length) return .5
    let previous = points[0]!
    for (const next of points.slice(1)) {
      if (progress <= next.progress) {
        const fraction = clamp((progress - previous.progress) / Math.max(.001, next.progress - previous.progress))
        return previous.x + (next.x - previous.x) * fraction
      }
      previous = next
    }
    return previous.x
  }

  function drawSource(context: CanvasRenderingContext2D, surface: HTMLCanvasElement, source: CanvasImageSource, width: number, height: number, progress: number) {
    const scale = Math.max(surface.width / width, surface.height / height)
    const cropWidth = surface.width / scale
    const cropHeight = surface.height / scale
    const riderPosition = window.innerWidth <= 600 ? .56 : .64
    const cropX = clamp(focusAt(progress) * width - cropWidth * riderPosition, 0, width - cropWidth)
    context.drawImage(source, cropX, (height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, surface.width, surface.height)
    ready.value = true
  }

  function render() {
    frame = 0
    const root = scene.value
    const surface = canvas.value
    const context = surface?.getContext('2d', { alpha: false })
    if (!root || !surface || !context) return

    if (needsMeasure) {
      geometry = {
        top: root.getBoundingClientRect().top + window.scrollY - window.innerHeight * .9,
        distance: Math.max(1, window.innerHeight * .9),
      }
      const bounds = surface.getBoundingClientRect()
      const density = Math.min(window.devicePixelRatio || 1, 1.5)
      surface.width = Math.max(1, Math.round(bounds.width * density))
      surface.height = Math.max(1, Math.round(bounds.height * density))
      needsMeasure = false
    }

    const motionEnabled = enabled.value && !motionPreference?.matches
    const progress = motionEnabled
      ? clamp((window.scrollY - geometry.top) / geometry.distance)
      : 1
    const lastFrame = Math.max(0, sequence.value.frameCount - 1)
    target = Math.round(progress * lastFrame)
    root.style.setProperty('--section-progress', progress.toFixed(4))
    const reveal = clamp(progress / .45)
    const contentReveal = clamp((progress - .2) / .5)
    root.style.setProperty('--section-cut', `${(1 - reveal) * 14}%`)
    root.style.setProperty('--content-opacity', String(.65 + contentReveal * .35))
    root.style.setProperty('--content-offset', `${(1 - contentReveal) * 35}px`)
    surface.dataset.targetFrame = String(target)
    surface.dataset.playback = motionEnabled && progress > 0 && progress < 1 ? 'transition' : 'still'
    loadFrame(target, 'high')
    const direction = target >= lastTarget ? 1 : -1
    if (motionEnabled && progress > 0 && progress < 1) {
      for (let offset = 1; offset <= 5; offset++) loadFrame(target + offset * direction)
      loadFrame(target - direction)
    }
    lastTarget = target

    const nearest = cache.has(target) ? target : [...cache.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0]
    const image = nearest === undefined ? undefined : cache.get(nearest)
    if (!image || nearest === undefined) return

    const sourceProgress = nearest / Math.max(1, sequence.value.frameCount - 1)
    drawSource(context, surface, image, image.naturalWidth, image.naturalHeight, sourceProgress)
    surface.dataset.frame = String(nearest)
  }

  onMounted(() => {
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionPreference.addEventListener('change', requestRender)
    window.addEventListener('scroll', requestRender, { passive: true })
    window.addEventListener('resize', requestMeasure, { passive: true })
    observer = new ResizeObserver(requestMeasure)
    if (scene.value) observer.observe(scene.value)
    observer.observe(document.body)
    if (canvas.value) observer.observe(canvas.value)
    watch(enabled, requestRender)
    watch(sequence, () => {
      revision++
      cache.clear()
      loading.clear()
      failed.clear()
      ready.value = false
      requestMeasure()
    }, { deep: true })
    requestMeasure()
  })

  onUnmounted(() => {
    disposed = true
    cancelAnimationFrame(frame)
    observer?.disconnect()
    motionPreference?.removeEventListener('change', requestRender)
    window.removeEventListener('scroll', requestRender)
    window.removeEventListener('resize', requestMeasure)
    cache.clear()
    loading.clear()
  })

  return { scene, canvas, ready }
}
