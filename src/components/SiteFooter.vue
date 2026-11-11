<script setup lang="ts">
import { ref } from 'vue'
import AppLink from './AppLink.vue'
import LegalLinks from './LegalLinks.vue'
import RaceIcon from './RaceIcon.vue'
import { useRaceSettings } from '../stores/race'
const { raceSettings } = useRaceSettings()
const infoDialog = ref<HTMLDialogElement | null>(null)
</script>

<template>
  <footer class="page-width py-10">
    <div class="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
      <AppLink class="flex items-center gap-4" href="/" aria-label="OŠK AMK Veľký Klíž, úvod"><span class="brand-mark" aria-hidden="true">AMK<span></span></span><span class="caption-3">OŠK AMK<br /><span class="text-muted">Veľký Klíž</span></span></AppLink>
      <p class="caption-4 text-muted">Jeden klub. Jedna vášeň. Motokros.</p>
      <a class="button-sm flex items-center gap-3" href="#top">Späť hore <RaceIcon class="-rotate-90" /></a>
    </div>
    <div class="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6 text-muted">
      <p class="caption-5">© {{ new Date().getFullYear() }} OŠK AMK Veľký Klíž</p>
      <LegalLinks />
      <button class="caption-4 underline underline-offset-4 hover:text-white" @click="infoDialog?.showModal()">Informácie o stránke</button>
    </div>
  </footer>
  <dialog ref="infoDialog" class="info-dialog rounded-lg border border-white/15 bg-surface p-8 text-white" aria-labelledby="info-title" @click="($event.target === infoDialog) && infoDialog?.close()">
    <div class="flex items-center justify-between gap-6"><h2 id="info-title" class="heading-5">Informácie o stránke</h2><button autofocus class="icon-button" aria-label="Zavrieť" @click="infoDialog?.close()">×</button></div>
    <p class="body-6 mt-6 text-muted">Stránka predstavuje OŠK AMK Veľký Klíž. {{ raceSettings.confirmed ? 'Aktuálny termín a pokyny nájdeš na stránke pretekov.' : 'Termín pretekov zatiaľ nie je potvrdený. Sleduj oznámenia klubu.' }} Fotografie od Maxa Leveridgea a John Bearby Images pochádzajú z Unsplash. Snímky videa od autora Midtrack pochádzajú z Pexels. Tieto ilustračné zábery nezobrazujú klub ani jeho trať.</p>
  </dialog>
</template>
