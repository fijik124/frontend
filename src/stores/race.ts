import { computed, onScopeDispose, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useMembership } from './membership'
import type { HeroRace } from '../types/hero'

export interface RaceScheduleItem { id: string; title: string; time: string; description: string }
export interface RaceConfiguration {
  name: string; series: string; startsAt: string; location: string; address: string; description: string
  confirmed: boolean; registrationOpen: boolean; registrationUrl: string; categories: string
  riderFee: string; spectatorFee: string; requirements: string; parking: string
  contactEmail: string; contactPhone: string; schedule: RaceScheduleItem[]
}
const KEY = 'amk-race-demo-v1'
const defaults: RaceConfiguration = {
  name: 'Motokros Veľký Klíž', series: 'Klubový motokros · sezóna 2027', startsAt: '2027-05-16T09:00:00+02:00',
  location: 'Veľký Klíž, Slovensko', address: '', description: 'Zvuk motorov. Napätie pred štartom. Buď pri tom, keď sa naša trať opäť premení na miesto veľkých súbojov.',
  confirmed: false, registrationOpen: false, registrationUrl: '', categories: '', riderFee: '', spectatorFee: '', requirements: '', parking: '', contactEmail: '', contactPhone: '',
  schedule: [
    { id: 'registration', time: '', title: 'Registrácia a technické preberanie', description: 'Kontrola prihlášok, dokladov a technického stavu motocyklov.' },
    { id: 'briefing', time: '', title: 'Rozprava s jazdcami', description: 'Pokyny organizátora, bezpečnosť a informácie o trati.' },
    { id: 'practice', time: '', title: 'Tréningy a kvalifikácia', description: 'Zoznámenie s traťou a rozdelenie jazdcov podľa kategórií.' },
    { id: 'races', time: '', title: 'Pretekové jazdy', description: 'Súboje jednotlivých kategórií podľa finálneho harmonogramu.' },
    { id: 'podium', time: '', title: 'Vyhlásenie výsledkov', description: 'Spoločné zakončenie pretekového dňa.' },
  ],
}
function valid(input: unknown): input is RaceConfiguration {
  if (!input || typeof input !== 'object') return false
  const race = input as RaceConfiguration
  const strings = ['name', 'series', 'startsAt', 'location', 'address', 'description', 'registrationUrl', 'categories', 'riderFee', 'spectatorFee', 'requirements', 'parking', 'contactEmail', 'contactPhone'] as const
  return strings.every(key => typeof race[key] === 'string' && race[key].length <= 5000) && typeof race.confirmed === 'boolean' && typeof race.registrationOpen === 'boolean' && Array.isArray(race.schedule) && race.schedule.length <= 20 && race.schedule.every(item => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.time === 'string' && typeof item.description === 'string')
}
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
  const raceStorageError = ref('')
  function load() {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (valid(parsed)) return parsed
        raceStorageError.value = 'Uložené preteky sa nepodarilo načítať. Zobrazuje sa ukážkové podujatie.'
      }
    } catch { raceStorageError.value = 'Úložisko prehliadača nie je dostupné. Nastavenia pretekov sa nedajú uložiť.' }
    return structuredClone(defaults)
  }
  const raceSettings = ref<RaceConfiguration>(load())
  const nextRace = computed<HeroRace>(() => ({ name: raceSettings.value.name, series: raceSettings.value.confirmed ? raceSettings.value.series : 'Ukážkové podujatie · ' + raceSettings.value.series, startsAt: raceSettings.value.startsAt || undefined, location: raceSettings.value.location, timeZone: 'Europe/Bratislava' }))
  const raceDate = computed(() => raceSettings.value.startsAt && Number.isFinite(Date.parse(raceSettings.value.startsAt)) ? new Date(raceSettings.value.startsAt) : null)
  const raceDay = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { day: '2-digit', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : '—')
  const raceMonth = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { month: 'short', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : 'TERMÍN PRIPRAVUJEME')
  const fullRaceDate = computed(() => raceDate.value ? new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(raceDate.value) : 'Termín oznámime čoskoro')
  const raceMapUrl = computed(() => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([raceSettings.value.address, raceSettings.value.location].filter(Boolean).join(', ')))

  function saveRaceSettings(input: RaceConfiguration) {
    if (!useMembership().hasPermission('race.manage')) throw new Error('Tvoja rola nemá oprávnenie na správu pretekov.')
    const clean = structuredClone(input)
    Object.keys(clean).forEach(key => { const field = key as keyof RaceConfiguration; if (typeof clean[field] === 'string') (clean[field] as string) = (clean[field] as string).trim() })
    if (!valid(clean) || clean.name.length < 3 || !clean.location) throw new Error('Vyplň názov podujatia a miesto konania.')
    if (clean.startsAt && !Number.isFinite(Date.parse(clean.startsAt))) throw new Error('Dátum pretekov nie je platný.')
    if (clean.confirmed && !clean.startsAt) throw new Error('Potvrdené podujatie musí mať dátum a čas.')
    if (clean.registrationUrl) {
      let url: URL
      try { url = new URL(clean.registrationUrl) } catch { throw new Error('Zadaj úplnú adresu registrácie vrátane https://.') }
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Registračný odkaz musí začínať https:// alebo http://.')
    }
    if (clean.registrationOpen && !clean.registrationUrl) throw new Error('Pri otvorenej registrácii zadaj funkčný registračný odkaz.')
    if (clean.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.contactEmail)) throw new Error('Kontaktný email nie je platný.')
    if (clean.schedule.some(item => !item.title.trim() || (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)))) throw new Error('Každý bod programu potrebuje názov a platný čas alebo prázdny čas.')
    try { localStorage.setItem(KEY, JSON.stringify(clean)) } catch { throw new Error('Nastavenia pretekov sa nepodarilo uložiť do prehliadača.') }
    raceSettings.value = clean
    raceStorageError.value = ''
  }
  function onStorage(event: StorageEvent) {
    if (event.key !== KEY || !event.newValue) return
    try { const parsed: unknown = JSON.parse(event.newValue); if (valid(parsed)) raceSettings.value = parsed } catch { raceStorageError.value = 'Nastavenia z inej karty sa nepodarilo načítať.' }
  }
  window.addEventListener('storage', onStorage)
  onScopeDispose(() => window.removeEventListener('storage', onStorage))

  return { raceSettings, nextRace, raceDay, raceMonth, fullRaceDate, raceMapUrl, raceStorageError, saveRaceSettings }
})

export function useRaceSettings() {
  const store = useRaceStore()
  return { ...storeToRefs(store), saveRaceSettings: store.saveRaceSettings }
}
