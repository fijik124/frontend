<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from './AppLink.vue'
import RaceIcon from './RaceIcon.vue'
import { navigate } from '../composables/useAppRouter'
import { useMembership } from '../stores/membership'
const menuOpen = defineModel<boolean>('menuOpen', { default: false })
const route = useRoute()
const { currentMember } = useMembership()
function setMode(mode: string) { void navigate(mode === 'main' ? '/' : '/preteky'); menuOpen.value = false }
watch(() => route.fullPath, () => { menuOpen.value = false })
watch(menuOpen, async open => {
  document.body.classList.toggle('menu-open', open)
  await nextTick()
  if (open) document.querySelector<HTMLElement>('#mobile-nav a, #mobile-nav button')?.focus()
  else document.querySelector<HTMLElement>('.menu-toggle')?.focus({ preventScroll: true })
})
function menuKeydown(event: KeyboardEvent) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') { menuOpen.value = false; return }
  if (event.key !== 'Tab') return
  const controls = [...document.querySelectorAll<HTMLElement>('.menu-toggle, #mobile-nav a, #mobile-nav button')]
  const first = controls[0], last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function resize() { if (window.innerWidth >= 1024) menuOpen.value = false }
onMounted(() => { window.addEventListener('keydown', menuKeydown); window.addEventListener('resize', resize) })
onUnmounted(() => { window.removeEventListener('keydown', menuKeydown); window.removeEventListener('resize', resize); document.body.classList.remove('menu-open') })
</script>

<template>  <header id="top" class="site-header page-width relative z-40">
    <div class="flex items-center justify-between gap-4 py-3 text-muted">
      <span class="caption-4 flex items-center gap-2"><span class="h-1 w-1 bg-race"></span> Slovenský motokros. Naša vášeň.</span>
      <span class="caption-4 hidden items-center gap-2 sm:flex">Veľký Klíž, SK <img class="slovak-flag" src="/images/slovakia.svg" alt="Slovenská vlajka" width="24" height="16" /></span>
    </div>
    <div class="nav-surface flex items-center justify-between gap-6 rounded-lg border border-white/10 bg-surface/95 px-4 py-4 backdrop-blur-xl lg:px-8">
      <a href="#top" class="club-brand flex shrink-0 items-center gap-3" aria-label="OŠK AMK Veľký Klíž, domov" @click.prevent="setMode('main')">
        <span class="brand-mark" aria-hidden="true">AMK<span></span></span>
        <span class="caption-3 leading-4">OŠK AMK<br /><span class="text-muted">Veľký Klíž</span></span>
      </a>
      <nav class="site-nav hidden items-center gap-8 lg:flex" aria-label="Hlavná navigácia">
        <AppLink class="nav-link" href="/">Domov</AppLink>
        <AppLink class="nav-link" href="/#o-klube">Náš klub</AppLink>
        <AppLink class="nav-link" href="/preteky">Preteky <span class="inline-block h-1 w-1 bg-race"></span></AppLink>
        <AppLink class="nav-link" href="/#galeria">Galéria</AppLink>
        <AppLink class="nav-link" :href="currentMember ? '/clenska-zona' : '/prihlasenie'">Členská zóna</AppLink>
      </nav>
      <AppLink href="/preteky" class="button-sm hidden items-center gap-6 rounded-sm bg-race px-3 py-2 text-white hover:bg-race-hover active:scale-[.98] sm:inline-flex">Poď na preteky <RaceIcon /></AppLink>
      <button type="button" class="menu-toggle flex h-10 w-10 flex-col items-center justify-center gap-2 lg:hidden" :class="{ 'is-open': menuOpen }" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? 'Zavrieť navigáciu' : 'Otvoriť navigáciu'" @click="menuOpen = !menuOpen"><span></span><span></span></button>
    </div>
    <nav v-if="menuOpen" id="mobile-nav" class="mobile-nav lg:hidden" aria-label="Mobilná navigácia" @keydown.esc="menuOpen = false">
      <span class="caption-3 text-race">Tvoj svet motokrosu</span>
      <AppLink class="heading-3" href="/">Domov</AppLink>
      <AppLink class="heading-3" href="/#o-klube" @click="menuOpen = false">Náš klub</AppLink>
      <AppLink class="heading-3" href="/preteky">Preteky</AppLink>
      <AppLink class="heading-3" href="/#galeria" @click="menuOpen = false">Galéria</AppLink>
      <AppLink class="heading-3" :href="currentMember ? '/clenska-zona' : '/prihlasenie'">Členská zóna</AppLink>
      <span class="caption-4 mt-auto text-muted">OŠK AMK Veľký Klíž · Slovensko</span>
    </nav>
  </header></template>
