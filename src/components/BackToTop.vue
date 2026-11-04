<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import RaceIcon from './RaceIcon.vue'

const emit = defineEmits<{ 'go-top': [] }>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

function goTop() {
  emit('go-top')
  document.querySelector<HTMLAnchorElement>('.club-brand')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}

onMounted(() => {
  const hero = document.querySelector('.hero')
  if (!hero) return
  observer = new IntersectionObserver(([entry]) => {
    if (entry) visible.value = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
  })
  observer.observe(hero)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <button v-if="visible" type="button" class="back-to-top fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-sm border border-white/20 bg-race text-white shadow-lg hover:bg-race-hover active:scale-[.98] md:right-6 md:bottom-6"
    aria-label="Späť na začiatok" title="Späť na začiatok" @click="goTop"><RaceIcon class="-rotate-90" /></button>
</template>
