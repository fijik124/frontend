<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import RaceIcon from './RaceIcon.vue'

const active = ref(false)
const bike = ref<HTMLElement | null>(null)
const launchButton = ref<HTMLButtonElement | null>(null)
const heroTarget = ref<HTMLElement | null>(null)
const currentStop = ref('Štart / Tvoj svet')
const distance = ref(0)
const keys = new Set<string>()
const stops = [
  { id: 'main-content', name: 'Štart / Tvoj svet' },
  { id: 'podujatie', name: '01 / Preteky' },
  { id: 'o-klube', name: '02 / Náš klub' },
  { id: 'nas-svet', name: '03 / Naša partia' },
  { id: 'galeria', name: '04 / Galéria' },
  { id: 'informacie', name: '05 / Dobre vedieť' },
  { id: 'program', name: '01 / Program pretekov' },
  { id: 'jazdci', name: '02 / Pre jazdcov' },
  { id: 'divaci', name: '03 / Pre divákov' },
  { id: 'miesto', name: '04 / Miesto konania' },
]
const status = computed(() => currentStop.value)
let x = 0, y = 0, vx = 0, vy = 0, wheel = 0
let frame = 0, lastTime = 0, facing = 1
let stopPositions: Array<{ y: number; name: string }> = []
const controls = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

function measureStops() {
  stopPositions = stops.flatMap((stop) => {
    const element = document.getElementById(stop.id)
    return element ? [{ y: element.getBoundingClientRect().top + window.scrollY, name: stop.name }] : []
  }).sort((a, b) => a.y - b.y)
}
async function start() {
  active.value = true
  distance.value = 0
  keys.clear()
  vx = vy = lastTime = 0
  x = Math.max(64, window.innerWidth * .65)
  y = window.scrollY + Math.min(window.innerHeight * .6, window.innerHeight - 200)
  measureStops()
  await nextTick()
  bike.value?.focus({ preventScroll: true })
  frame = requestAnimationFrame(tick)
}
async function stop(restoreFocus = true) {
  active.value = false
  keys.clear()
  cancelAnimationFrame(frame)
  frame = 0
  await nextTick()
  if (restoreFocus) launchButton.value?.focus({ preventScroll: true })
}
function isEditable(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}
function keydown(event: KeyboardEvent) {
  if (!active.value || isEditable(event.target)) return
  if (event.key === 'Escape') { event.preventDefault(); stop(); return }
  const key = event.key.toLowerCase()
  if (controls.has(key)) { event.preventDefault(); keys.add(key) }
}
function keyup(event: KeyboardEvent) { keys.delete(event.key.toLowerCase()) }
function clearKeys() { keys.clear(); vx = vy = 0 }
function hold(event: PointerEvent, key: string) {
  if (!active.value) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  keys.add(key)
}
function tick(time: number) {
  if (!active.value) return
  const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : 0
  lastTime = time
  const blocked = !!document.querySelector('dialog[open], .mobile-nav')
  if (blocked || document.hidden) clearKeys()
  const dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
  const dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'))
  const normal = Math.hypot(dx, dy) || 1
  const smoothing = 1 - Math.exp(-8 * dt)
  vx += (dx / normal * 420 - vx) * smoothing
  vy += (dy / normal * 420 - vy) * smoothing
  const oldX = x, oldY = y
  x = Math.max(52, Math.min(window.innerWidth - 52, x + vx * dt))
  y = Math.max(64, Math.min(document.documentElement.scrollHeight - 64, y + vy * dt))
  const traveled = Math.hypot(x - oldX, y - oldY)
  distance.value += traveled / 100
  wheel += traveled * 3
  if (Math.abs(vx) > 15) facing = vx > 0 ? 1 : -1
  if (Math.abs(vy) > 10 && !blocked) {
    const screenY = y - window.scrollY
    const topEdge = 120
    const bottomEdge = Math.max(180, window.innerHeight - 210)
    if (screenY < topEdge || screenY > bottomEdge) {
      window.scrollTo({ top: y - (screenY < topEdge ? topEdge : bottomEdge), behavior: 'instant' })
    }
  }
  if (bike.value) {
    bike.value.style.transform = 'translate3d(' + (x - 52) + 'px,' + (y - window.scrollY - 40) + 'px,0)'
    bike.value.style.setProperty('--facing', String(facing))
    bike.value.style.setProperty('--lean', String(vx / 100) + 'deg')
    bike.value.style.setProperty('--wheel', String(wheel * facing) + 'deg')
    bike.value.classList.toggle('is-moving', traveled > .2)
  }
  currentStop.value = [...stopPositions].reverse().find((point) => y >= point.y - 80)?.name ?? stops[0]!.name
  frame = requestAnimationFrame(tick)
}
function resize() { if (active.value) { x = Math.min(x, window.innerWidth - 52); measureStops() } }
function visibility() { if (document.hidden) clearKeys() }
onMounted(() => {
  heroTarget.value = document.querySelector('[data-ride-launcher]')
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  window.addEventListener('blur', clearKeys)
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', visibility)
})
onUnmounted(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
  window.removeEventListener('blur', clearKeys)
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', visibility)
})
defineExpose({ stop })
</script>

<template>
  <Teleport v-if="heroTarget" :to="heroTarget">
    <button ref="launchButton" type="button" class="ride-launch button-sm" :aria-label="active ? 'Ukončiť jazdu na motorke' : 'Spustiť jazdu na motokrosovej motorke pomocou klávesov W A S D'" :aria-pressed="active" @click="active ? stop() : start()"><RaceIcon name="helmet" /><span>{{ active ? 'Ukončiť jazdu' : 'Zajazdi si' }}</span><span class="ride-key-hint caption-3">W A S D</span></button>
  </Teleport>
  <div v-if="active" class="ride-controls">
    <div class="ride-dashboard rounded-lg border border-white/20 bg-ink/95 p-4 text-white shadow-xl backdrop-blur-xl" aria-label="Ovládanie motorky">
      <div class="flex items-center justify-between gap-6"><span class="caption-3 text-race">Voľná jazda</span><button class="ride-close caption-3 rounded-sm px-2 py-1 hover:bg-white/10" @click="stop()">Koniec <span class="text-muted">Esc</span></button></div>
      <p class="title-3 mt-2" role="status" aria-live="polite">{{ status }}</p>
      <p class="caption-5 mt-2 text-muted">W hore · S dole · A/D do strán</p>
      <div class="mt-3 flex items-end justify-between gap-6"><div class="ride-touch-controls" aria-label="Smer jazdy"><button v-for="control in [{ key: 'a', label: 'Doľava', text: 'A' }, { key: 'w', label: 'Hore', text: 'W' }, { key: 's', label: 'Dole', text: 'S' }, { key: 'd', label: 'Doprava', text: 'D' }]" :key="control.key" class="ride-key button-sm" :aria-label="control.label" @pointerdown="hold($event, control.key)" @pointerup="keys.delete(control.key)" @pointercancel="keys.delete(control.key)" @lostpointercapture="keys.delete(control.key)">{{ control.text }}</button></div><span class="caption-4 tabular-nums text-muted">{{ distance.toFixed(1) }} m*</span></div>
      <p class="caption-5 mt-2 text-muted">* Len pre zábavu. Bez vodičáku.</p>
    </div>
  </div>
  <div v-if="active" ref="bike" class="ride-bike" tabindex="-1" role="img" aria-label="Tvoja motokrosová motorka. Pohybuj sa klávesmi W A S D. Escape ukončí jazdu.">
    <div class="ride-bike__dust" aria-hidden="true"><i></i><i></i><i></i></div>
    <svg class="ride-bike__drawing" viewBox="0 0 160 110" fill="none" aria-hidden="true">
      <ellipse cx="82" cy="101" rx="65" ry="5" fill="#000" opacity=".25" />
      <g class="ride-wheel ride-wheel--rear"><circle cx="31" cy="78" r="23" fill="#181818" stroke="#fff" stroke-width="3" /><circle cx="31" cy="78" r="15" stroke="#9a9a96" stroke-width="2" /><path d="M31 63v30M16 78h30m-25-10 21 21m0-21-21 21" stroke="#aaa" stroke-width="2" /><circle cx="31" cy="78" r="5" fill="#f54b2b" /></g>
      <g class="ride-wheel ride-wheel--front"><circle cx="131" cy="78" r="23" fill="#181818" stroke="#fff" stroke-width="3" /><circle cx="131" cy="78" r="15" stroke="#9a9a96" stroke-width="2" /><path d="M131 63v30M116 78h30m-25-10 21 21m0-21-21 21" stroke="#aaa" stroke-width="2" /><circle cx="131" cy="78" r="5" fill="#f54b2b" /></g>
      <path d="m31 78 33-31 29 31H31m33-31 39 4-10 27m14-42 24 42" stroke="#ddd" stroke-width="6" stroke-linejoin="round" />
      <path d="m18 48 36-4 27 6-13 12H45Zm58-6h29l7 16-27 2Z" fill="#f54b2b" stroke="#181818" stroke-width="2" />
      <path d="M37 42h43" stroke="#181818" stroke-width="7" stroke-linecap="round" /><path d="m111 39 23 4m-22-13-8 6" stroke="#fff" stroke-width="5" stroke-linecap="round" />
      <path d="m77 19-15 20 21 13-13 20" stroke="#181818" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
      <path d="m77 19-15 20 21 13-13 20" stroke="#f3f2ee" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="m77 21 15 13 15-1" stroke="#f54b2b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M69 15a13 13 0 1 1 26 0v7H72Z" fill="#f54b2b" stroke="#181818" stroke-width="2" /><path d="M81 12h19l-3 7H84Z" fill="#181818" /><path d="M84 7h13" stroke="#fff" stroke-width="3" /><path d="M64 72h14" stroke="#181818" stroke-width="7" stroke-linecap="round" />
      <path d="m115 48 9-2 4 15-9 2Z" fill="#fff" /><path d="m86 47 3 8" stroke="#fff" stroke-width="4" />
    </svg>
  </div>
</template>

<style scoped>
.ride-controls { position: fixed; left: 24px; bottom: 24px; z-index: 45; }
.ride-launch { display: flex; align-items: center; gap: 12px; padding: 8px 12px; min-height: 48px; border: 1px solid #ffffff40; border-radius: 4px; background: #1f1f1f; color: white; }
.ride-launch:hover { background: #f54b2b; transform: translateY(-4px); }.ride-launch:active { transform: scale(.98); }
.ride-key-hint { color: #bbb; border: 1px solid #ffffff30; padding: 4px 8px; border-radius: 4px; }
.ride-dashboard { width: 300px; }
.ride-touch-controls { display: flex; gap: 4px; }.ride-key { width: 40px; height: 40px; background: #313131; border: 1px solid #ffffff20; border-radius: 4px; touch-action: none; user-select: none; }.ride-key:active { background: #f54b2b; }
.ride-bike { position: fixed; z-index: 44; top: 0; left: 0; width: 104px; height: 80px; pointer-events: none; outline: none; will-change: transform; }
.ride-bike__drawing { width: 104px; height: 80px; filter: drop-shadow(0 2px 2px #0003); transform: scaleX(var(--facing, 1)) rotate(var(--lean, 0deg)); }
.ride-wheel { transform: rotate(var(--wheel, 0deg)); }.ride-wheel--rear { transform-origin: 31px 78px; }.ride-wheel--front { transform-origin: 131px 78px; }
.ride-bike__dust { position: absolute; inset: 0; opacity: 0; transform: scaleX(var(--facing, 1)); }.is-moving .ride-bike__dust { opacity: .7; }
.ride-bike__dust i { position: absolute; bottom: 8px; left: 8px; width: 8px; height: 8px; background: #bca184; border-radius: 50%; animation: dust 600ms cubic-bezier(.22,1,.36,1) infinite; }.ride-bike__dust i:nth-child(2) { animation-delay: 200ms; }.ride-bike__dust i:nth-child(3) { animation-delay: 400ms; }
@keyframes dust { from { transform: translate(0, 0) scale(.5); opacity: .8; } to { transform: translate(-32px, -16px) scale(1.5); opacity: 0; } }
@media (max-width: 600px) { .ride-controls { left: 16px; bottom: 80px; }.ride-dashboard { width: 280px; }.ride-key-hint { display: none; } }
@media (prefers-reduced-motion: reduce) { .ride-bike__dust { display: none; }.ride-launch:hover { transform: none; } }
</style>

