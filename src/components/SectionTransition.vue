<script setup lang="ts">
import { computed } from 'vue'
import { useScrollFrames } from '../composables/useScrollFrames'
import { motocrossSequence } from '../data/motocrossSequence'
import type { HeroFrameSequence } from '../types/hero'

const props = withDefaults(defineProps<{
  sequence?: HeroFrameSequence
  animated?: boolean
}>(), {
  sequence: () => motocrossSequence,
  animated: true,
})

const { scene, canvas, ready } = useScrollFrames(computed(() => props.sequence), computed(() => props.animated))
</script>

<template>
  <div ref="scene" class="section-transition">
    <div class="section-transition__panel">
      <div class="section-transition__media" aria-hidden="true">
        <div class="section-transition__stage">
          <img class="section-transition__poster" :src="`${sequence.basePath}/frame-${String(sequence.frameCount - 1).padStart(4, '0')}.jpg`" alt="" loading="lazy" />
          <canvas ref="canvas" class="section-transition__canvas" :class="{ 'section-transition__canvas--ready': ready }"></canvas>
          <div class="section-transition__shade"></div>
        </div>
      </div>
      <div class="section-transition__content"><slot /></div>
      <div class="section-transition__accent" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.section-transition { position: relative; isolation: isolate; background: #181818; --section-cut: 0%; --content-opacity: 1; --content-offset: 0px; }
.section-transition__panel { position: relative; min-height: 740px; clip-path: polygon(0 var(--section-cut), 100% 0, 100% 100%, 0 100%); overflow: clip; }
.section-transition__media { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.section-transition__stage { position: sticky; top: 0; height: 100svh; overflow: hidden; }
.section-transition__canvas, .section-transition__poster { position: absolute; top: 0; right: 0; width: 53%; height: 100%; object-fit: cover; filter: saturate(.7) contrast(1.08); }
.section-transition__canvas { opacity: 0; }.section-transition__canvas--ready { opacity: 1; }
.section-transition__shade { position: absolute; inset: 0 0 0 47%; background: #18181820; }
.section-transition__content { position: relative; z-index: 1; opacity: var(--content-opacity); transform: translate3d(0, var(--content-offset), 0); }
.section-transition__accent { position: absolute; top: 0; left: 0; z-index: 2; width: 96px; height: 4px; background: #f54b2b; }
@media (max-width: 767px) {
  .section-transition__panel { min-height: 900px; }
  .section-transition__canvas, .section-transition__poster { top: auto; bottom: 0; width: 100%; height: 44%; }
  .section-transition__shade { inset: auto 0 0; height: 44%; background: #18181820; }
}
@media (prefers-reduced-motion: reduce) { .section-transition__panel { clip-path: none; }.section-transition__content { opacity: 1; transform: none; } }
</style>
