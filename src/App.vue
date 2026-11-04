<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import MotocrossRide from './components/MotocrossRide.vue'
import { useMembership } from './stores/membership'
import { useRaceSettings } from './stores/race'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const marketingPage = computed(() => route.meta.layout === 'site')
const { currentMember, hasPermission } = useMembership()
const { raceSettings } = useRaceSettings()
watch([currentMember, () => route.fullPath], () => {
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
    <RouterView v-slot="{ Component, route: activeRoute }"><component :is="Component" :key="activeRoute.meta.layout === 'dashboard' ? 'dashboard' : activeRoute.name" /></RouterView>
    <SiteFooter v-if="marketingPage" />
    <MotocrossRide v-if="marketingPage" :key="route.path" />
  </div>
</template>

