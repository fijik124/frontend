<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import type { HeroAction, HeroMode, HeroPhotoCredit, HeroRace } from '../types/hero'

const props = withDefaults(defineProps<{
  mode?: HeroMode
  eyebrow?: string
  title?: string[]
  accentTitle?: string
  description?: string
  image?: string
  imageAlt?: string
  imagePosition?: string
  photoCredit?: HeroPhotoCredit | null
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  race?: HeroRace
  raceConfirmed?: boolean
}>(), {
  mode: 'main',
  image: '/images/motocross-racing.jpg',
  imageAlt: 'Motokrosový pretekár v zákrute s prúdom hliny za zadným kolesom',
  imagePosition: '58% 50%',
})

defineEmits<{
  'primary-action': []
  'secondary-action': []
}>()

const isRace = computed(() => props.mode === 'next-race')
const headingId = `hero-${useId()}`
const heading = computed(() => props.title ?? (isRace.value ? [props.race?.name ?? 'Najbližšie'] : ['Tu sa', 'rodí']))
const accent = computed(() => props.accentTitle ?? (isRace.value ? (props.race?.name ? 'Na štarte.' : 'preteky.') : 'vášeň.'))
const credit = computed(() => props.photoCredit !== undefined ? props.photoCredit : (
  props.image === '/images/motocross-racing.jpg' ? {
    author: 'Max Leveridge',
    href: 'https://unsplash.com/photos/a-person-riding-a-dirt-bike-on-a-dirt-track-MqbOIZ0XXvY',
    source: 'Unsplash',
  } : null
))
const intro = computed(() => props.eyebrow ?? (isRace.value ? 'Najbližšie preteky' : 'OŠK AMK Veľký Klíž'))
const copy = computed(() => props.description ?? (isRace.value
  ? 'Zvuk motorov. Napätie pred štartom. Buď pri tom, keď sa naša trať opäť premení na miesto veľkých súbojov.'
  : 'Hlina pod kolesami. Adrenalín v krvi. Sme motokrosová komunita z Veľkého Klíža. A toto je náš svet.'))

const startTime = computed(() => props.race?.startsAt ? Date.parse(props.race.startsAt) : NaN)
const hasDate = computed(() => Number.isFinite(startTime.value))
const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

function stopTimer() {
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}

onMounted(() => {
  watch([isRace, startTime], () => {
    stopTimer()
    now.value = Date.now()
    if (isRace.value && hasDate.value && startTime.value > now.value) {
      timer = setInterval(() => {
        now.value = Date.now()
        if (now.value >= startTime.value) stopTimer()
      }, 1000)
    }
  }, { immediate: true })
})
onUnmounted(stopTimer)

const hasStarted = computed(() => hasDate.value && now.value !== null && now.value >= startTime.value)
const countdown = computed(() => {
  const remaining = hasDate.value && now.value !== null
    ? Math.max(0, Math.floor((startTime.value - now.value) / 1000)) : null
  return [
    { label: 'Dní', value: remaining === null ? '—' : String(Math.floor(remaining / 86400)).padStart(2, '0') },
    { label: 'Hodín', value: remaining === null ? '—' : String(Math.floor(remaining / 3600) % 24).padStart(2, '0') },
    { label: 'Minút', value: remaining === null ? '—' : String(Math.floor(remaining / 60) % 60).padStart(2, '0') },
    { label: 'Sekúnd', value: remaining === null ? '—' : String(remaining % 60).padStart(2, '0') },
  ]
})

const raceDate = computed(() => {
  if (!hasDate.value) return null
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  try {
    return new Intl.DateTimeFormat('sk-SK', { ...options, timeZone: props.race?.timeZone ?? 'Europe/Bratislava' }).format(startTime.value)
  } catch {
    return new Intl.DateTimeFormat('sk-SK', { ...options, timeZone: 'Europe/Bratislava' }).format(startTime.value)
  }
})
</script>

<template>
  <section class="hero" :class="{ 'hero--race': isRace }" :aria-labelledby="headingId">
    <div class="hero__visual"><img :src="image" :alt="imageAlt" :style="{ objectPosition: imagePosition }" fetchpriority="high" /><div class="hero__image-tint"></div></div>
    <div class="hero__image-label caption-3"><span class="hero__dot"></span> Motokros. Bez filtra.</div>
    <span class="hero__coordinate caption-4" aria-hidden="true">VEĽKÝ KLÍŽ / SLOVENSKO</span>
    <div class="hero__inner page-width">
      <div class="hero__body">
        <div class="hero__copy">
          <p class="hero__eyebrow eyebrow"><span class="hero__dot" aria-hidden="true"></span>{{ intro }}</p>
          <h1 :id="headingId" class="hero__heading"><span v-for="(line, index) in heading" :key="index">{{ line }}</span><span class="hero__accent">{{ accent }}</span></h1>
          <p class="hero__description body-3">{{ copy }}</p>
          <div v-if="primaryAction || secondaryAction" class="hero__actions">
            <component :is="primaryAction.href ? 'a' : 'button'" v-if="primaryAction" :href="primaryAction.href" :type="primaryAction.href ? undefined : 'button'" class="hero__button hero__button--primary button-sm" @click="$emit('primary-action')">{{ primaryAction.label }}<svg viewBox="0 0 256 256" fill="none" aria-hidden="true"><path d="M40 128h176m-72-72 72 72-72 72" /></svg></component>
            <component :is="secondaryAction.href ? 'a' : 'button'" v-if="secondaryAction" :href="secondaryAction.href" :type="secondaryAction.href ? undefined : 'button'" class="hero__button hero__button--secondary button-sm" @click="$emit('secondary-action')">{{ secondaryAction.label }}<span aria-hidden="true">↗</span></component>
          </div>
        </div>
        <aside v-if="isRace" class="hero__race-panel" aria-label="Termín pretekov a odpočítavanie">
          <span class="hero__small-label caption-3">{{ race?.series ?? 'Race weekend' }}</span>
          <h2 class="heading-5 mt-4"><time v-if="raceDate" :datetime="race?.startsAt">{{ raceDate }}</time><span v-else>Termín oznámime čoskoro</span></h2>
          <p v-if="race?.location" class="body-6 mt-3 text-muted">{{ race.location }}</p>
          <div v-if="hasDate && !hasStarted" class="hero__countdown-wrap">
            <span class="hero__small-label caption-3">Do štartu zostáva</span>
            <div class="hero__countdown" role="timer" aria-label="Odpočítavanie do štartu" aria-live="off">
              <div v-for="unit in countdown" :key="unit.label" class="hero__countdown-unit"><span class="hero__countdown-value heading-4">{{ unit.value }}</span><span class="hero__countdown-label caption-4">{{ unit.label }}</span></div>
            </div>
          </div>
          <p v-else class="body-6 mt-8 text-muted"><span class="hero__dot" aria-hidden="true"></span> {{ hasStarted ? 'Podujatie sa začalo' : 'Pripravujeme ďalšie preteky' }}</p>
          <p v-if="!raceConfirmed" class="caption-5 mt-6 text-muted">Ukážkový termín. Oficiálny dátum potvrdíme.</p>
        </aside>
      </div>
      <div class="hero__footer">
        <a :href="primaryAction?.href ?? '#o-klube'" class="hero__explore caption-3"><span class="hero__scroll-icon" aria-hidden="true">↓</span> Objav viac <span class="hero__scroll-line" aria-hidden="true"></span></a>
        <a v-if="credit" class="hero__photo-credit caption-5" :href="credit.href" target="_blank" rel="noopener noreferrer" :aria-label="'Fotografia: ' + credit.author"><span>Foto: {{ credit.author }}</span><span v-if="credit.source">/ {{ credit.source }}</span><span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "../assets/main.css";
.hero { position: relative; isolation: isolate; overflow: hidden; background: #181818; color: #fff; }
.hero__visual { position: absolute; z-index: -1; inset: 24px 0 0 42%; clip-path: polygon(12% 0, 100% 0, 100% 100%, 0 100%); }
.hero__visual img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.65) contrast(1.1); }
.hero__image-tint { position: absolute; inset: 0; background: #00000018; }
.hero__inner { position: relative; }
.hero__body { display: flex; align-items: center; justify-content: space-between; gap: 32px; min-height: 660px; padding: 64px 0 48px; }
.hero__copy { flex: 0 1 600px; min-width: 0; }
.hero__eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; color: #b5b5af; }
.hero__dot { display: inline-block; width: 4px; height: 4px; background: #f54b2b; flex-shrink: 0; }
.hero__heading { @apply text-6xl font-bold tracking-tight lg:text-8xl; max-width: 680px; text-transform: uppercase; }
.hero__heading > span { display: block; width: fit-content; background: linear-gradient(90deg, #fff, #b5b5b5); background-clip: text; color: transparent; }
.hero__heading .hero__accent { color: #f54b2b; background: none; }
.hero__description { max-width: 360px; margin-top: 24px; color: #b5b5af; }
.hero__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 32px; }
.hero__button { display: inline-flex; align-items: center; justify-content: center; gap: 24px; padding: 8px 12px; min-height: 48px; border-radius: 2px; text-decoration: none; }
.hero__button--primary { background: #f54b2b; color: white; }
.hero__button--primary:hover { background: #dd391b; }
.hero__button:active { transform: scale(.98); }
.hero__button svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 12; stroke-linecap: round; stroke-linejoin: round; }
.hero__button--secondary { padding-left: 0; color: #fff; background: transparent; }
.hero__button--secondary:hover { color: #f54b2b; }
.hero__button--secondary > span { @apply text-xl; }
.hero__footer { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 0 32px; }
.hero__explore { display: inline-flex; align-items: center; gap: 16px; text-transform: uppercase; letter-spacing: .08em; }
.hero__scroll-icon { display: grid; width: 32px; height: 40px; place-items: center; border: 1px solid #ffffff40; border-radius: 999px; }
.hero__scroll-line { width: 64px; height: 1px; background: #ffffff30; }
.hero__photo-credit { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; color: #fff; text-decoration: none; padding: 8px 12px; border-radius: 2px; background: #181818b3; }
.hero__photo-credit:hover { color: #fca692; }
.hero__image-label { position: absolute; z-index: 1; top: 48px; right: 64px; display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #fff; background: #181818c9; text-transform: uppercase; letter-spacing: .12em; }
.hero__coordinate { position: absolute; right: 24px; top: 48%; writing-mode: vertical-rl; letter-spacing: .2em; color: #fff; }
.hero__race-panel { width: 380px; flex-shrink: 0; padding: 32px; background: #181818ed; border: 1px solid #ffffff30; border-radius: 4px; backdrop-filter: blur(16px); }
.hero__small-label { color: #fca692; }
.hero__countdown-wrap { margin-top: 32px; }
.hero__countdown { display: grid; grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.hero__countdown-unit { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.hero__countdown-value { font-variant-numeric: tabular-nums; }
.hero__countdown-label { color: #a7a7a3; }
.hero--race .hero__heading { @apply text-5xl lg:text-6xl; overflow-wrap: anywhere; max-width: 580px; }
.hero--race .hero__visual { opacity: .6; }
@media (min-width: 1600px) { .hero__visual { right: calc((100vw - 1600px) / 2); } }
@media (max-width: 1023px) {
  .hero__body { min-height: 620px; }.hero__visual { left: 32%; }.hero__image-label { right: 40px; }
  .hero__copy { flex-basis: 440px; }.hero__description { max-width: 320px; }
  .hero__race-panel { width: 320px; padding: 24px; }
  .hero--race .hero__body { flex-direction: column; align-items: flex-start; }.hero--race .hero__copy { flex-basis: auto; }.hero--race .hero__race-panel { width: 100%; max-width: 480px; }
}
@media (max-width: 600px) {
  .hero__visual { inset: 16px 0 auto 28%; height: 360px; clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%); }
  .hero__visual img { object-position: 59% 50% !important; }.hero__image-tint { background: #18181855; }
  .hero__body { min-height: 650px; padding: 48px 0 32px; align-items: flex-end; }.hero__copy { flex-basis: 100%; }
  .hero__eyebrow { max-width: 190px; margin-bottom: 32px; color: #fff; }.hero__heading { @apply text-6xl; }
  .hero__description { margin-top: 24px; max-width: 300px; }.hero__actions { gap: 8px; margin-top: 24px; }
  .hero__button { gap: 16px; }.hero__footer { flex-wrap: wrap; gap: 16px; padding-bottom: 24px; }
  .hero__image-label { top: 32px; right: 24px; padding: 8px; font-size: 12px; max-width: 140px; letter-spacing: 0; }
  .hero__coordinate { display: none; }.hero__photo-credit { margin-left: auto; background: transparent; padding: 0; color: #aaa; }
  .hero__scroll-line { width: 32px; }.hero--race .hero__heading { @apply text-5xl; }.hero--race .hero__body { gap: 24px; padding-top: 64px; }
}
</style>

