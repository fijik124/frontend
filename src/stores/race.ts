import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { apiResponse, json } from '../api'
import type { HeroRace } from '../types/hero'
export interface RaceScheduleItem { id: string; title: string; time: string; description: string }
export interface RaceConfiguration {
  name: string; series: string; startsAt: string; location: string; address: string; description: string
  confirmed: boolean; registrationOpen: boolean; registrationUrl: string; categories: string
  riderFee: string; spectatorFee: string; requirements: string; parking: string
  contactEmail: string; contactPhone: string; schedule: RaceScheduleItem[]
}

const emptyRace = (): RaceConfiguration => ({ name: '', series: '', startsAt: '', location: '', address: '', description: '',
  confirmed: false, registrationOpen: false, registrationUrl: '', categories: '', riderFee: '', spectatorFee: '', requirements: '', parking: '', contactEmail: '', contactPhone: '', schedule: [] })
export function raceLocalDate(iso: string) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return ''
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso))
  const get = (key: string) => parts.find(part => part.type === key)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}
export function raceIsoDate(local: string) {
  if (!local) return ''
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error('Zadaj platný dátum a čas pretekov.')
  const desired = Date.parse(local + ':00Z')
  let utc = desired
  for (let i = 0; i < 3; i++) utc += desired - Date.parse(raceLocalDate(new Date(utc).toISOString()) + ':00Z')
  const iso = new Date(utc).toISOString()
  if (raceLocalDate(iso) !== local) throw new Error('Tento čas neexistuje pri zmene letného času. Vyber iný čas.')
  return iso
}

export const useRaceStore = defineStore('race', () => {
  const raceSettings = ref<RaceConfiguration>(emptyRace()), raceStorageError = ref(''), raceLoading = ref(false), raceSaving = ref(false), raceExists = ref(false)
  let version = '"0"'
  async function loadRace() {
    raceLoading.value = true; raceStorageError.value = ''
    try { const response = await apiResponse('/race'); const race: RaceConfiguration | null = await response.json(); version = response.headers.get('ETag') ?? '"0"'; raceExists.value = !!race; raceSettings.value = race ?? emptyRace() }
    catch (cause) { raceStorageError.value = cause instanceof Error ? cause.message : 'Preteky sa nepodarilo načítať.' }
    finally { raceLoading.value = false }
  }
  const nextRace = computed<HeroRace>(() => ({ name: raceSettings.value.name || 'Najbližšie preteky pripravujeme', series: raceSettings.value.series,
    startsAt: raceSettings.value.startsAt || undefined, location: raceSettings.value.location, timeZone: 'Europe/Bratislava' }))
  const raceDate = computed(() => raceSettings.value.startsAt && Number.isFinite(Date.parse(raceSettings.value.startsAt)) ? new Date(raceSettings.value.startsAt) : null)
  const raceDay = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { day: '2-digit', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : '—')
  const raceMonth = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { month: 'short', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : 'TERMÍN PRIPRAVUJEME')
  const fullRaceDate = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : 'Termín oznámime čoskoro')
  const raceMapUrl = computed(() => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([raceSettings.value.address, raceSettings.value.location].filter(Boolean).join(', ')))

  async function saveRaceSettings(input: RaceConfiguration) {
    if (raceSaving.value) return
    raceSaving.value = true
    try { const response = await apiResponse('/race', { ...json('PUT', input), headers: { 'If-Match': version } });
      raceSettings.value = await response.json(); version = response.headers.get('ETag') ?? version; raceExists.value = true; raceStorageError.value = '' }
    catch (cause) { raceStorageError.value = cause instanceof Error ? cause.message : 'Preteky sa nepodarilo uložiť.'; throw cause }
    finally { raceSaving.value = false }
  }
  void loadRace()
  return { raceSettings, nextRace, raceDay, raceMonth, fullRaceDate, raceMapUrl, raceStorageError, raceLoading, raceSaving, raceExists, loadRace, saveRaceSettings }
})
export function useRaceSettings() { const store = useRaceStore(); return { ...storeToRefs(store), loadRace: store.loadRace, saveRaceSettings: store.saveRaceSettings } }
