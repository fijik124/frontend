<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import MotocrossRide from './components/MotocrossRide.vue'
import BackToTop from './components/BackToTop.vue'
import { useMembership } from './stores/membership'
import { useRaceSettings } from './stores/race'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const ride = ref<InstanceType<typeof MotocrossRide> | null>(null)
const marketingPage = computed(() => route.meta.layout === 'site')
const { currentMember, hasPermission } = useMembership()
const { raceSettings, raceStorageError, raceLoading, loadRace } = useRaceSettings()
watch([currentMember, () => route.fullPath], () => {
  menuOpen.value = false
  if (route.meta.requiresSession && (!currentMember.value || currentMember.value.status === 'inactive')) void router.replace('/prihlasenie')
  else if ((route.meta.permissions as string[] | undefined)?.length && !(route.meta.permissions as string[]).some(permission => hasPermission(permission))) void router.replace('/clenska-zona')
})
watchEffect(() => {
  if (route.name === 'race') document.title = raceSettings.value.name + ' | OŠK AMK Veľký Klíž'
})
</script>
<template>
  <a href="#main-content" class="skip-link button-sm">Preskočiť na obsah</a>
  <SiteHeader v-if="marketingPage" v-model:menu-open="menuOpen" />
  <div :inert="menuOpen">
    <div v-if="marketingPage && (raceLoading || raceStorageError)" class="page-width py-6" role="status"><p>{{ raceLoading ? 'Načítavame údaje o pretekoch…' : raceStorageError }}</p><button v-if="raceStorageError" class="dashboard-secondary mt-4" @click="loadRace">Skúsiť znova</button></div>
    <RouterView v-slot="{ Component, route: activeRoute }"><component :is="Component" :key="activeRoute.meta.layout === 'dashboard' ? 'dashboard' : activeRoute.name" /></RouterView>
    <SiteFooter v-if="marketingPage" />
    <MotocrossRide v-if="route.name === 'home' || route.name === 'race'" ref="ride" :key="route.path" />
    <BackToTop v-if="route.name === 'home'" @go-top="ride?.stop(false)" />
  </div>
</template>

