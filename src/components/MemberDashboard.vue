<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from './AppLink.vue'
import RaceIcon from './RaceIcon.vue'
import MemberFields from './MemberFields.vue'
import RaceSettings from './RaceSettings.vue'
import MemberLicenseCard from './MemberLicenseCard.vue'
import RoleSettings from './RoleSettings.vue'
import { navigate } from '../composables/useAppRouter'
import { useMembership, statusLabels, groupOptions, licenseExpired, todaySlovakia, type Member, type MemberInput, type MemberStatus, type MemberLicense, type MemberRole } from '../stores/membership'

const { members, licenses, roles, activity, currentMember, currentLicense, isAdmin, isStaff, hasPermission, roleName, storageError, createMember, updateMember, removeMember, resetDemo, logout, issueLicense, revokeLicense, updateLicenseValidity } = useMembership()
type Tab = 'overview' | 'members' | 'licenses' | 'requests' | 'profile' | 'race' | 'roles' | 'settings'
const route = useRoute()
const tab = computed<Tab>(() => (route.meta.dashboardTab as Tab) ?? 'overview')
const canViewMembers = computed(() => hasPermission('members.read') || hasPermission('members.write'))
const canWriteMembers = computed(() => hasPermission('members.write'))
const canManageLicenses = computed(() => hasPermission('licenses.manage'))
const query = ref('')
const statusFilter = ref<MemberStatus | ''>('')
const groupFilter = ref('')
const pageNumber = ref(1)
const pageSize = 6
const toast = ref('')
const error = ref('')
const editor = ref<HTMLDialogElement | null>(null)
const confirmation = ref<HTMLDialogElement | null>(null)
const editingId = ref<string | null>(null)
const confirmAction = ref<'remove' | 'reset' | 'revoke'>('remove')
const target = ref<Member | null>(null)
const licenseDialog = ref<HTMLDialogElement | null>(null)
const licenseFirstName = ref('')
const licenseLastName = ref('')
const licenseRole = ref<MemberRole>('member')
const licenseLimited = ref(false)
const licenseExpiry = ref('')
const newMemberLimited = ref(false)
const newMemberExpiry = ref('')
const validityDialog = ref<HTMLDialogElement | null>(null)
const editingLicense = ref<MemberLicense | null>(null)
const validityLimited = ref(false)
const validityDate = ref('')
const validityError = ref('')
const licenseFilter = ref('')
const generatedLicense = ref<MemberLicense | null>(null)
const targetLicense = ref<MemberLicense | null>(null)
const licenseLabels = { available: 'Nepriradená', used: 'Priradená', revoked: 'Zrušená' }
const filteredLicenses = computed(() => licenses.value.filter(license => normalize(license.firstName + ' ' + license.lastName + ' ' + license.code).includes(normalize(query.value.trim())) && (!licenseFilter.value || (licenseExpired(license) ? 'expired' : license.status) === licenseFilter.value)))
const blank = (): MemberInput => ({ firstName: '', lastName: '', name: '', email: '', phone: '', group: 'Neurčené', role: 'member', status: 'active', feePaid: false, number: '' })
const form = ref<MemberInput>(blank())
const profile = ref<MemberInput>(blank())
const tabNames: Record<Tab, string> = { overview: 'Prehľad', members: 'Členovia', licenses: 'Členské licencie', requests: 'Žiadosti', profile: 'Môj profil', race: 'Najbližšie preteky', roles: 'Roly a oprávnenia', settings: 'Nastavenia dema' }
const menu = computed(() => ([
  { id: 'overview', name: 'Prehľad', icon: 'grid', show: true },
  { id: 'members', name: 'Členovia', icon: 'people', show: canViewMembers.value },
  { id: 'licenses', name: 'Licencie', icon: 'flag', show: canManageLicenses.value },
  { id: 'requests', name: 'Žiadosti', icon: 'mail', show: canWriteMembers.value },
  { id: 'roles', name: 'Roly a oprávnenia', icon: 'settings', show: hasPermission('roles.manage') },
  { id: 'race', name: 'Preteky', icon: 'helmet', show: hasPermission('race.manage') },
  { id: 'profile', name: 'Môj profil', icon: 'helmet', show: true },
  { id: 'settings', name: 'Nastavenia dema', icon: 'settings', show: hasPermission('roles.manage') },
] as const).filter(item => item.show))
const activeCount = computed(() => members.value.filter(m => m.status === 'active').length)
const pendingCount = computed(() => members.value.filter(m => m.status === 'pending').length)
const paidCount = computed(() => members.value.filter(m => m.feePaid).length)
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const filtered = computed(() => members.value.filter(m => {
  const matchesQuery = normalize(m.name + ' ' + m.email + ' ' + m.id + ' ' + m.number).includes(normalize(query.value.trim()))
  return matchesQuery && (!statusFilter.value || m.status === statusFilter.value) && (!groupFilter.value || m.group === groupFilter.value) && (tab.value !== 'requests' || m.status === 'pending')
}))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visibleMembers = computed(() => filtered.value.slice((pageNumber.value - 1) * pageSize, pageNumber.value * pageSize))
const recentMembers = computed(() => [...members.value].sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt)).slice(0, 4))
const ownActivity = computed(() => canViewMembers.value ? activity.value : activity.value.filter(a => a.text.includes(currentMember.value?.name ?? '\u0000')))
let toastTimer: ReturnType<typeof setTimeout> | undefined
watch([query, statusFilter, groupFilter, tab], () => { pageNumber.value = 1 })
watch(pages, count => { pageNumber.value = Math.min(pageNumber.value, count) })
watch(currentMember, member => {
  if (member) profile.value = { ...member }
  if (!member) navigate('/prihlasenie', true)
}, { immediate: true })
onUnmounted(() => clearTimeout(toastTimer))
function initials(name: string) { return name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() }
function date(value: string) { return new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) }
function notify(message: string) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = '' }, 5000) }
function selectTab(value: Tab) {
  const paths: Record<Tab, string> = { overview: '/clenska-zona', members: '/clenska-zona/clenovia', licenses: '/clenska-zona/licencie', requests: '/clenska-zona/ziadosti', roles: '/clenska-zona/roly', race: '/clenska-zona/preteky', profile: '/clenska-zona/moj-profil', settings: '/clenska-zona/nastavenia' }
  void navigate(paths[value]); error.value = ''; query.value = ''; statusFilter.value = ''; groupFilter.value = ''
}
function edit(member?: Member) {
  error.value = ''
  editingId.value = member?.id ?? null
  form.value = member ? { ...member } : blank()
  newMemberLimited.value = false; newMemberExpiry.value = ''
  editor.value?.showModal()
}
function save() {
  error.value = ''
  try {
    if (editingId.value) updateMember(editingId.value, form.value)
    else {
      if (newMemberLimited.value && !newMemberExpiry.value) throw new Error('Vyber dátum platnosti licencie.')
      createMember(form.value, undefined, newMemberLimited.value ? newMemberExpiry.value : null)
    }
    editor.value?.close()
    notify(editingId.value ? 'Údaje člena boli uložené.' : 'Nový člen bol pridaný.')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Zmeny sa nepodarilo uložiť.' }
}
function approve(member: Member) {
  try { updateMember(member.id, { ...member, status: 'active' }); notify('Žiadosť člena ' + member.name + ' bola schválená.') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Žiadosť sa nepodarilo schváliť.' }
}
function askRemove(member: Member) {
  editor.value?.close()
  target.value = member
  confirmAction.value = 'remove'
  error.value = ''
  confirmation.value?.showModal()
}
function askReset() { confirmAction.value = 'reset'; error.value = ''; confirmation.value?.showModal() }
function openLicenseGenerator() {
  licenseFirstName.value = ''; licenseLastName.value = ''; generatedLicense.value = null; error.value = ''
  licenseRole.value = 'member'; licenseLimited.value = false; licenseExpiry.value = ''
  licenseDialog.value?.showModal()
}
function generateLicense() {
  error.value = ''
  try {
    if (licenseLimited.value && !licenseExpiry.value) throw new Error('Vyber dátum platnosti licencie.')
    generatedLicense.value = issueLicense(licenseFirstName.value, licenseLastName.value, { validUntil: licenseLimited.value ? licenseExpiry.value : null, role: licenseRole.value })
    notify('Licencia bola vygenerovaná pre ' + licenseFirstName.value + ' ' + licenseLastName.value + '.')
  }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Licenciu sa nepodarilo vygenerovať.' }
}
async function copyLicense(code: string) {
  try { await navigator.clipboard.writeText(code); notify('Licenčné číslo bolo skopírované.') }
  catch { error.value = 'Kód sa nepodarilo skopírovať. Označ licenčné číslo a skopíruj ho ručne.' }
}
function askRevoke(license: MemberLicense) { targetLicense.value = license; confirmAction.value = 'revoke'; error.value = ''; confirmation.value?.showModal() }
function editValidity(license: MemberLicense) { editingLicense.value = license; validityLimited.value = !!license.validUntil; validityDate.value = license.validUntil ?? ''; validityError.value = ''; validityDialog.value?.showModal() }
function saveValidity() {
  try {
    if (!editingLicense.value) return
    if (validityLimited.value && !validityDate.value) throw new Error('Vyber dátum platnosti.')
    updateLicenseValidity(editingLicense.value.id, validityLimited.value ? validityDate.value : null)
    validityDialog.value?.close(); notify('Platnosť licencie bola uložená. Licenčné číslo zostáva rovnaké.')
  } catch (cause) { validityError.value = cause instanceof Error ? cause.message : 'Platnosť sa nepodarilo uložiť.' }
}
const confirmTitle = computed(() => confirmAction.value === 'reset' ? 'Obnoviť demo databázu?' : confirmAction.value === 'revoke' ? 'Zrušiť registračnú licenciu?' : 'Odstrániť člena?')
const confirmDescription = computed(() => confirmAction.value === 'reset' ? 'Tvoje lokálne členské zmeny a licencie sa nahradia pôvodnými ukážkovými údajmi. Existujúce demo registrácie sa odstránia.' : confirmAction.value === 'revoke' ? 'Licencia ' + targetLicense.value?.code + ' pre ' + targetLicense.value?.firstName + ' ' + targetLicense.value?.lastName + ' už nebude platná na registráciu.' : 'Člen ' + target.value?.name + ' (' + target.value?.email + ') bude odstránený z demo databázy. Jeho použitá licencia zostane zablokovaná.')
function confirm() {
  error.value = ''
  try {
    if (confirmAction.value === 'reset') { resetDemo(); notify('Demo databáza bola obnovená.') }
    else if (confirmAction.value === 'revoke' && targetLicense.value) { revokeLicense(targetLicense.value.id); notify('Licencia bola zrušená.') }
    else if (target.value) { removeMember(target.value.id); notify('Člen bol odstránený z demo databázy.') }
    confirmation.value?.close()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Akcia sa nepodarila.' }
}
function saveProfile() {
  error.value = ''
  try { if (currentMember.value) updateMember(currentMember.value.id, profile.value); notify('Tvoj profil bol uložený.') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Profil sa nepodarilo uložiť.' }
}
function signOut() { logout(); navigate('/prihlasenie') }
function exportCsv(all = false) {
  if (!canViewMembers.value) return
  const rows = (all ? members.value : filtered.value).map(m => [m.id, m.name, m.email, m.phone, m.group, statusLabels[m.status], roleName(m.role), m.number, m.feePaid ? 'Uhradené' : 'Neuhradené', date(m.joinedAt)])
  const escapeCell = (value: string) => '"' + (/^[\s]*[=+@\-]/.test(value) ? "'" + value : value).replaceAll('"', '""') + '"'
  const content = [['ID', 'Meno', 'Email', 'Telefón', 'Typ členstva', 'Stav', 'Rola', 'Štartové číslo', 'Príspevok', 'Dátum vstupu'], ...rows].map(row => row.map(escapeCell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'amk-clenovia-demo.csv'; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  notify('CSV export obsahuje ' + rows.length + ' členov.')
}
</script>

<template>
  <div v-if="currentMember" class="dashboard-shell min-h-svh bg-paper text-ink lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside class="dashboard-sidebar bg-ink p-6 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
      <div class="flex items-center justify-between gap-6"><AppLink href="/" class="flex items-center gap-3"><span class="brand-mark">AMK<span></span></span><span class="caption-3">OŠK AMK<br /><span class="text-muted">Veľký Klíž</span></span></AppLink><span class="caption-3 rounded-sm border border-race/40 px-2 py-1 text-[#fca692] lg:hidden">DEMO</span></div>
      <p class="eyebrow mt-12 hidden text-muted lg:block">{{ isStaff ? 'Správa občianskeho združenia' : 'Členská zóna' }}</p>
      <nav class="dashboard-nav mt-6 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Členská navigácia"><button v-for="item in menu" :key="item.id" class="dashboard-nav-link" :class="{ 'is-active': tab === item.id }" :aria-current="tab === item.id ? 'page' : undefined" @click="selectTab(item.id)"><RaceIcon :name="item.icon" /><span>{{ item.name }}</span><span v-if="item.id === 'requests' && pendingCount" class="ml-auto rounded-sm bg-white/15 px-2 py-0.5 text-xs">{{ pendingCount }}</span></button></nav>
      <div class="mt-8 hidden lg:mt-auto lg:block"><div class="rounded-sm border border-white/10 bg-surface p-4"><span class="caption-3 text-[#fca692]">Lokálne demo</span><p class="caption-5 mt-2 text-muted">Žiadne heslá ani server. Všetky zmeny zostávajú v tvojom prehliadači.</p></div><AppLink href="/" class="button-sm mt-6 flex items-center gap-3 text-muted hover:text-white"><RaceIcon class="rotate-180" /> Späť na web</AppLink><button class="button-sm mt-4 flex items-center gap-3 text-muted hover:text-white" @click="signOut"><RaceIcon name="logout" /> Odhlásiť sa</button></div>
    </aside>
    <div class="min-w-0">
      <header class="dashboard-topbar flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-white px-6 py-4 lg:px-10"><p class="caption-4 text-ink/55">Členská zóna <span class="mx-2">/</span> <span class="text-ink">{{ tabNames[tab] }}</span></p><div class="flex items-center gap-4"><span class="caption-3 hidden rounded-sm bg-race/10 px-3 py-1 text-race sm:block">Lokálne demo</span><span class="member-avatar">{{ initials(currentMember.name) }}</span><div><p class="body-6 font-semibold">{{ currentMember.name }}</p><p class="caption-5 text-ink/55">{{ roleName(currentMember.role) }}</p></div><button class="caption-3 ml-2 text-ink/55 hover:text-race lg:hidden" @click="signOut">Odhlásiť</button></div></header>
      <main id="main-content" class="dashboard-content mx-auto max-w-[1600px] p-6 lg:p-10">
        <div v-if="toast" class="dashboard-toast body-6 mb-6" role="status"><RaceIcon name="check" /><span>{{ toast }}</span><button class="ml-auto" aria-label="Zavrieť oznámenie" @click="toast = ''">×</button></div>
        <p v-if="storageError" class="form-error mb-6" role="alert">{{ storageError }}</p>
        <p v-if="error && !editor?.open && !confirmation?.open && !licenseDialog?.open" class="form-error mb-6" role="alert">{{ error }}</p>
        <template v-if="tab === 'overview'">
          <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p class="eyebrow text-race">{{ isStaff ? 'Tvoj klub pod kontrolou' : 'Vitaj vo svojom klube' }}</p><h1 class="heading-3 mt-3">Ahoj, {{ currentMember.name.split(' ')[0] }}.</h1><p class="body-6 mt-3 text-ink/55">{{ isStaff ? 'Všetko podstatné o našej partii na jednom mieste.' : 'Tvoje členstvo a klubové informácie na jednom mieste.' }}</p></div><button v-if="canWriteMembers" class="dashboard-primary" @click="edit()"><RaceIcon name="plus" /> Pridať člena</button><button v-else class="dashboard-primary" @click="selectTab('profile')">Upraviť môj profil <RaceIcon /></button></div>
          <template v-if="canViewMembers">
            <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article v-for="stat in [{ label: 'Všetci členovia', value: members.length, note: 'Členská základňa', icon: 'people' as const }, { label: 'Aktívni členovia', value: activeCount, note: 'Aktuálne členstvo', icon: 'helmet' as const }, { label: 'Nové žiadosti', value: pendingCount, note: 'Čakajú na schválenie', icon: 'mail' as const }, { label: 'Uhradené príspevky', value: paidCount, note: 'Označené v demo databáze', icon: 'check' as const }]" :key="stat.label" class="dashboard-card p-6"><div class="flex items-center justify-between gap-3"><span class="body-6 text-ink/60">{{ stat.label }}</span><RaceIcon :name="stat.icon" class="text-race" /></div><p class="heading-2 mt-6 tabular-nums">{{ stat.value }}</p><p class="caption-5 mt-3 text-ink/50">{{ stat.note }}</p></article></div>
            <div v-if="pendingCount && canWriteMembers" class="demo-notice mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 class="title-3">Noví ľudia chcú byť súčasťou partie.</h2><p class="body-6 mt-1">Na posúdenie čaká {{ pendingCount }} {{ pendingCount === 1 ? 'žiadosť' : 'žiadostí' }}.</p></div><button class="button-sm flex items-center gap-3 self-start whitespace-nowrap text-race" @click="selectTab('requests')">Pozrieť žiadosti <RaceIcon /></button></div>
            <div class="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]"><section class="dashboard-card p-6"><div class="flex flex-wrap items-center justify-between gap-4"><h2 class="heading-5">Najnovší členovia</h2><button class="button-sm text-race" @click="selectTab('members')">Všetci členovia</button></div><div class="mt-4 divide-y divide-ink/10"><button v-for="member in recentMembers" :key="member.id" class="flex w-full items-center gap-3 py-4 text-left hover:text-race" :disabled="!canWriteMembers" @click="edit(member)"><span class="member-avatar">{{ initials(member.name) }}</span><span class="min-w-0 flex-1"><span class="body-6 block truncate font-semibold">{{ member.name }}</span><span class="caption-5 text-ink/55">{{ member.group }}</span></span><span class="status-badge hidden sm:inline-flex" :class="'status-' + member.status">{{ statusLabels[member.status] }}</span></button></div></section><section class="dashboard-card p-6"><h2 class="heading-5">Naša partia v číslach</h2><div v-for="group in groupOptions" :key="group" class="mt-6"><div class="body-6 mb-3 flex justify-between gap-4"><span>{{ group }}</span><span class="font-semibold">{{ members.filter(m => m.group === group).length }}</span></div><div class="h-2 overflow-hidden rounded-full bg-ink/5"><div class="h-full rounded-full bg-race" :style="{ width: (members.filter(m => m.group === group).length / Math.max(members.length, 1) * 100) + '%' }"></div></div></div><p class="caption-5 mt-8 text-ink/50">Prehľad sa mení spolu s tvojou demo databázou.</p></section></div>
          </template>
          <template v-else><section class="dashboard-card mt-8 p-8"><div class="flex flex-wrap items-center justify-between gap-4"><p class="eyebrow text-race">Moje členstvo</p><span class="status-badge" :class="'status-' + currentMember.status">{{ statusLabels[currentMember.status] }}</span></div><h2 class="heading-3 mt-8">{{ currentMember.name }}</h2><p class="body-3 mt-3 text-ink/60">{{ currentMember.group }} · {{ currentMember.id }}</p><p v-if="currentMember.status === 'pending'" class="demo-notice body-6 mt-6">Tvoja demo žiadosť čaká na schválenie. V ukážkovom účte správcu ju nájdeš v sekcii Žiadosti.</p><div class="mt-8 grid gap-6 sm:grid-cols-3"><div><p class="caption-4 text-ink/50">Členom od</p><p class="title-3 mt-2">{{ date(currentMember.joinedAt) }}</p></div><div><p class="caption-4 text-ink/50">Členský príspevok</p><p class="title-3 mt-2">{{ currentMember.feePaid ? 'Uhradený' : 'Zatiaľ neuhradený' }}</p></div><div><p class="caption-4 text-ink/50">Štartové číslo</p><p class="title-3 mt-2">{{ currentMember.number || 'Nie je uvedené' }}</p></div></div><MemberLicenseCard :license="currentLicense" /></section><section class="mt-6 flex flex-col justify-between gap-6 rounded-sm bg-ink p-8 text-white sm:flex-row sm:items-center"><div><p class="eyebrow text-[#fca692]">Najbližšie podujatie</p><h2 class="heading-5 mt-3">Motokros Veľký Klíž</h2><p class="body-6 mt-3 text-muted">Návrh podujatia. Oficiálny termín potvrdíme.</p></div><AppLink href="/preteky" class="dashboard-primary self-start">Informácie o pretekoch <RaceIcon /></AppLink></section></template>
          <section class="dashboard-card mt-6 p-6"><h2 class="heading-5">{{ canViewMembers ? 'Posledná aktivita' : 'Aktivita môjho členstva' }}</h2><ul v-if="ownActivity.length" class="mt-4 grid gap-4"><li v-for="item in ownActivity.slice(0, 5)" :key="item.id" class="flex items-start gap-3"><span class="mt-2 h-1 w-1 shrink-0 bg-race"></span><div><p class="body-6">{{ item.text }}</p><p class="caption-5 mt-1 text-ink/50">{{ date(item.at) }}</p></div></li></ul><p v-else class="body-6 mt-4 text-ink/55">Tu sa zobrazia zmeny tvojho členstva.</p></section>
        </template>

        <template v-else-if="canViewMembers && (tab === 'members' || tab === 'requests')">
          <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p class="eyebrow text-race">{{ tab === 'requests' ? 'Nové tváre v klube' : 'Naša členská základňa' }}</p><h1 class="heading-3 mt-3">{{ tab === 'requests' ? 'Žiadosti o členstvo' : 'Členovia klubu' }} <span class="text-ink/35">{{ tab === 'requests' ? pendingCount : members.length }}</span></h1><p class="body-6 mt-3 text-ink/55">{{ tab === 'requests' ? 'Skontroluj údaje a schváľ nových členov demo klubu.' : 'Vyhľadaj, pridaj alebo uprav údaje členov združenia.' }}</p></div><div class="flex flex-wrap gap-3"><button class="dashboard-secondary" :disabled="!filtered.length" @click="exportCsv()"><RaceIcon name="download" /> Export CSV</button><button v-if="canWriteMembers" class="dashboard-primary" @click="edit()"><RaceIcon name="plus" /> Pridať člena</button></div></div>
          <section class="dashboard-card mt-8 overflow-hidden"><div class="grid gap-3 p-6 md:grid-cols-[minmax(0,1fr)_auto_auto]"><label class="relative block"><span class="sr-only">Vyhľadať člena</span><RaceIcon name="search" class="pointer-events-none absolute top-3 left-3 text-ink/40" /><input v-model="query" type="search" class="form-input mt-0 pl-10" placeholder="Hľadať meno, email alebo číslo…" /></label><select v-if="tab !== 'requests'" v-model="statusFilter" class="form-input mt-0 md:w-48" aria-label="Filtrovať podľa stavu"><option value="">Všetky stavy</option><option value="active">Aktívny</option><option value="pending">Čaká na schválenie</option><option value="inactive">Neaktívny</option></select><select v-model="groupFilter" class="form-input mt-0 md:w-48" aria-label="Filtrovať podľa typu členstva"><option value="">Všetky skupiny</option><option v-for="group in groupOptions" :key="group">{{ group }}</option></select></div>
            <div v-if="visibleMembers.length" class="overflow-x-auto"><table class="member-table w-full min-w-[760px] text-left"><thead><tr><th>Člen</th><th>Typ členstva</th><th>Stav</th><th>Príspevok</th><th><span class="sr-only">Akcie</span></th></tr></thead><tbody><tr v-for="member in visibleMembers" :key="member.id"><td><div class="flex items-center gap-3"><span class="member-avatar shrink-0">{{ initials(member.name) }}</span><div><span class="body-6 block font-semibold">{{ member.name }} <span v-if="member.role === 'admin'" class="caption-5 ml-1 text-race">Správca</span></span><span class="caption-5 text-ink/55">{{ member.email }}</span></div></div></td><td><span class="body-6">{{ member.group }}</span><span v-if="member.number" class="caption-5 mt-1 block text-ink/50">#{{ member.number }}</span></td><td><span class="status-badge" :class="'status-' + member.status">{{ statusLabels[member.status] }}</span></td><td><span class="body-6" :class="member.feePaid ? 'text-emerald-700' : 'text-ink/50'">{{ member.feePaid ? 'Uhradený' : 'Neuhradený' }}</span></td><td><div class="flex items-center justify-end gap-3"><button v-if="member.status === 'pending' && canWriteMembers" class="caption-3 text-emerald-700 hover:underline" :aria-label="'Schváliť žiadosť: ' + member.name" @click="approve(member)">Schváliť</button><button v-if="canWriteMembers" class="table-icon-button" :aria-label="'Upraviť člena: ' + member.name" @click="edit(member)"><RaceIcon name="edit" /></button></div></td></tr></tbody></table></div>
            <div v-else class="flex flex-col items-center px-6 py-16 text-center"><RaceIcon name="people" class="h-12 w-12 text-ink/30" /><h2 class="heading-5 mt-6">{{ tab === 'requests' && !query && !groupFilter ? 'Všetky žiadosti sú vybavené.' : 'Nenašli sme žiadneho člena.' }}</h2><p class="body-6 mt-3 max-w-sm text-ink/55">{{ query || groupFilter || statusFilter ? 'Skús iné meno alebo zruš filtre.' : 'Noví členovia sa tu zobrazia po registrácii alebo pridaní správcom.' }}</p><button v-if="query || groupFilter || statusFilter" class="dashboard-secondary mt-6" @click="query = ''; statusFilter = ''; groupFilter = ''">Zrušiť filtre</button><button v-else-if="tab === 'members'" class="dashboard-primary mt-6" @click="edit()">Pridať prvého člena</button></div>
            <div class="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 px-6 py-4"><p class="caption-4 text-ink/55">{{ filtered.length ? (pageNumber - 1) * pageSize + 1 : 0 }} až {{ Math.min(pageNumber * pageSize, filtered.length) }} z {{ filtered.length }} členov</p><div class="flex items-center gap-3"><button class="pagination-button" :disabled="pageNumber === 1" aria-label="Predchádzajúca strana" @click="pageNumber--"><RaceIcon class="rotate-180" /></button><span class="caption-4">{{ pageNumber }} / {{ pages }}</span><button class="pagination-button" :disabled="pageNumber === pages" aria-label="Nasledujúca strana" @click="pageNumber++"><RaceIcon /></button></div></div>
          </section>
        </template>

        
        <template v-else-if="canManageLicenses && tab === 'licenses'">
          <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p class="eyebrow text-race">Registrácia len pre pozvaných</p><h1 class="heading-3 mt-3">Registračné licencie.</h1><p class="body-6 mt-3 max-w-2xl text-ink/55">Licencia je viazaná na meno, priezvisko a člena. Nastav jej trvalú alebo časovo obmedzenú platnosť a rolu nového člena.</p></div><button class="dashboard-primary self-start" @click="openLicenseGenerator"><RaceIcon name="plus" /> Vygenerovať licenciu</button></div>
          <div class="demo-notice body-6 mt-6">Toto sú klubové registračné kódy pre lokálnu ukážku. Nenahrádzajú oficiálnu športovú licenciu.</div>
          <section class="dashboard-card mt-8 overflow-hidden"><div class="grid gap-3 p-6 sm:grid-cols-[minmax(0,1fr)_200px]"><label class="relative block"><span class="sr-only">Hľadať meno alebo licenciu</span><RaceIcon name="search" class="pointer-events-none absolute top-3 left-3 text-ink/40" /><input v-model="query" type="search" class="form-input mt-0 pl-10" placeholder="Hľadať meno alebo licenčné číslo…" /></label><select v-model="licenseFilter" class="form-input mt-0" aria-label="Filtrovať licencie podľa stavu"><option value="">Všetky licencie</option><option value="available">Nepriradené</option><option value="used">Priradené</option><option value="expired">Po platnosti</option><option value="revoked">Zrušené</option></select></div>
            <div v-if="filteredLicenses.length" class="overflow-x-auto"><table class="member-table w-full min-w-[740px] text-left"><thead><tr><th>Meno a priezvisko</th><th>Registračné číslo</th><th>Stav</th><th>Platnosť a rola</th><th>Vydaná</th><th><span class="sr-only">Akcie</span></th></tr></thead><tbody><tr v-for="license in filteredLicenses" :key="license.id"><td class="body-6 font-semibold">{{ license.firstName }} {{ license.lastName }}</td><td><input class="license-code body-6 w-full min-w-52 bg-transparent font-mono" :value="license.code" readonly :aria-label="'Licencia pre ' + license.firstName + ' ' + license.lastName" @focus="($event.target as HTMLInputElement).select()" /></td><td><span class="status-badge" :class="license.status === 'available' ? 'status-active' : license.status === 'used' ? 'status-pending' : 'status-inactive'">{{ licenseExpired(license) ? 'Platnosť vypršala' : licenseLabels[license.status] }}</span></td><td class="caption-4 whitespace-nowrap"><span>{{ license.validUntil ? date(license.validUntil + 'T12:00:00Z') : 'Bez obmedzenia' }}</span><span class="caption-5 mt-1 block text-ink/55">{{ roleName(license.role) }}</span></td><td class="caption-4 whitespace-nowrap text-ink/55">{{ date(license.issuedAt) }}</td><td><div class="flex justify-end gap-3"><button class="button-sm text-race hover:underline" :aria-label="'Skopírovať licenciu pre ' + license.firstName + ' ' + license.lastName" @click="copyLicense(license.code)">Kopírovať</button><button v-if="license.status !== 'revoked'" class="button-sm text-ink/55 hover:text-race" :aria-label="'Upraviť platnosť licencie pre ' + license.firstName + ' ' + license.lastName" @click="editValidity(license)">Platnosť</button><button v-if="license.status === 'available'" class="button-sm text-ink/55 hover:text-race" @click="askRevoke(license)">Zrušiť</button></div></td></tr></tbody></table></div>
            <div v-else class="flex flex-col items-center px-6 py-16 text-center"><RaceIcon name="flag" class="h-12 w-12 text-ink/30" /><h2 class="heading-5 mt-6">{{ licenses.length ? 'Žiadna licencia nezodpovedá filtru.' : 'Najprv licencia. Potom registrácia.' }}</h2><p class="body-6 mt-3 max-w-sm text-ink/55">Vytvor licenciu pre meno a priezvisko budúceho člena. Po registrácii zostáva rovnaké číslo priradené jeho členstvu.</p><button v-if="!licenses.length" class="dashboard-primary mt-6" @click="openLicenseGenerator">Vygenerovať prvú licenciu</button><button v-else class="dashboard-secondary mt-6" @click="query = ''; licenseFilter = ''">Zrušiť filtre</button></div>
          </section>
        </template>
        <RoleSettings v-else-if="hasPermission('roles.manage') && tab === 'roles'" /><RaceSettings v-else-if="hasPermission('race.manage') && tab === 'race'" />
<template v-else-if="tab === 'profile'"><p class="eyebrow text-race">Tvoja vizitka v klube</p><h1 class="heading-3 mt-3">Môj profil.</h1><p class="body-6 mt-3 text-ink/55">Udržuj svoje členské údaje aktuálne.</p><div class="mt-8 grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]"><form class="dashboard-card p-6 sm:p-8" @submit.prevent="saveProfile"><h2 class="heading-5 mb-6">Osobné údaje</h2><MemberFields v-model="profile" :lock-name="!canWriteMembers" /><button class="dashboard-primary mt-8" type="submit">Uložiť zmeny <RaceIcon name="check" /></button></form><aside class="rounded-sm bg-ink p-8 text-white"><span class="eyebrow text-[#fca692]">Členská karta / Demo</span><h2 class="heading-5 mt-8">{{ currentMember.name }}</h2><p class="body-6 mt-3 text-muted">{{ currentMember.id }}</p><span class="status-badge mt-6" :class="'status-' + currentMember.status">{{ statusLabels[currentMember.status] }}</span><dl class="body-6 mt-8 grid gap-4"><div><dt class="text-muted">Členom od</dt><dd class="mt-1">{{ date(currentMember.joinedAt) }}</dd></div><div><dt class="text-muted">Príspevok</dt><dd class="mt-1">{{ currentMember.feePaid ? 'Uhradený' : 'Neuhradený' }}</dd></div></dl><MemberLicenseCard :license="currentLicense" /></aside></div></template>

        <template v-else-if="hasPermission('roles.manage') && tab === 'settings'"><p class="eyebrow text-race">Tvoje lokálne prostredie</p><h1 class="heading-3 mt-3">Nastavenia dema.</h1><div class="dashboard-card mt-8 max-w-3xl p-8"><h2 class="heading-5">Ako funguje táto ukážka</h2><p class="body-6 mt-4 text-ink/60">Členovia a zmeny sa ukladajú do localStorage tohto prehliadača. Prihlásený demo účet si táto karta pamätá cez sessionStorage. Nie je tu server, overovanie identity ani skutočné heslá.</p><p class="body-6 mt-4 text-ink/60">Roly slúžia iba na ukážku rozhrania. Demo nie je vhodné na evidenciu skutočných osobných údajov. Zmeny v jednej karte sa zobrazia aj v ďalších otvorených kartách.</p><div class="mt-8 flex flex-wrap gap-3"><button class="dashboard-secondary" @click="exportCsv(true)"><RaceIcon name="download" /> Exportovať všetkých členov</button><button class="dashboard-secondary text-race" :disabled="!isAdmin" @click="askReset()">Obnoviť ukážkové údaje</button></div></div></template>
        <p class="caption-5 mt-10 text-ink/45">OŠK AMK Veľký Klíž · Lokálna ukážka · Všetky zobrazené osoby sú fiktívne</p>
      </main>
    </div>
    <dialog ref="editor" class="member-dialog" aria-labelledby="member-editor-title" @keydown.esc.prevent="editor?.close()"><form @submit.prevent="save"><div class="flex items-start justify-between gap-6"><div><p class="eyebrow text-race">Členská evidencia</p><h2 id="member-editor-title" class="heading-5 mt-3">{{ editingId ? 'Upraviť člena' : 'Nový člen klubu' }}</h2></div><button type="button" class="table-icon-button" aria-label="Zavrieť formulár" @click="editor?.close()">×</button></div><p class="body-6 mt-3 text-ink/55">Zmeny sa uložia iba do lokálnej demo databázy.</p><div class="mt-6"><MemberFields v-model="form" admin /></div>
<div v-if="!editingId" class="mt-6 rounded-sm border border-ink/15 p-4"><p class="title-3">Členská licencia sa vytvorí automaticky.</p><label class="form-label mt-4">Platnosť licencie<select v-model="newMemberLimited" name="member-license-validity" class="form-input"><option :value="false">Bez časového obmedzenia</option><option :value="true">Do zvoleného dátumu</option></select></label><label v-if="newMemberLimited" class="form-label mt-4">Platná do (vrátane)<input v-model="newMemberExpiry" name="member-license-expiry" class="form-input" type="date" :min="todaySlovakia()" required /></label><p class="caption-5 mt-3 text-ink/55">Licencia bude priradená tomuto členovi a zvolenej role.</p></div>
<div v-else><MemberLicenseCard :license="licenses.find(license => license.memberId === editingId) ?? null" /><button v-if="licenses.find(license => license.memberId === editingId)" type="button" class="button-sm mt-3 text-race hover:underline" @click="editValidity(licenses.find(license => license.memberId === editingId)!)">Upraviť platnosť licencie</button></div>
<p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><div class="mt-8 flex flex-wrap items-center justify-between gap-4"><button v-if="editingId && editingId !== currentMember.id" type="button" class="button-sm text-race hover:underline" @click="askRemove(members.find(m => m.id === editingId)!)">Odstrániť člena</button><div class="ml-auto flex gap-3"><button type="button" class="dashboard-secondary" @click="editor?.close()">Zrušiť</button><button type="submit" class="dashboard-primary">Uložiť člena <RaceIcon name="check" /></button></div></div></form></dialog>
    
    <dialog ref="licenseDialog" class="member-dialog max-w-lg" aria-labelledby="license-generator-title" @keydown.esc.prevent="licenseDialog?.close()"><div class="flex items-start justify-between gap-4"><div><p class="eyebrow text-race">Automatický generátor</p><h2 id="license-generator-title" class="heading-5 mt-3">{{ generatedLicense ? 'Licencia je pripravená.' : 'Nová registračná licencia' }}</h2></div><button class="table-icon-button" aria-label="Zavrieť generátor" @click="licenseDialog?.close()">×</button></div>
      <form v-if="!generatedLicense" class="mt-6" @submit.prevent="generateLicense"><p class="body-6 mb-6 text-ink/60">Zadaj meno a priezvisko budúceho člena. Jedinečné číslo sa vytvorí automaticky a bude viazané na tieto údaje.</p><div class="grid gap-4 sm:grid-cols-2"><label class="form-label" for="license-first-name">Meno<input id="license-first-name" v-model="licenseFirstName" class="form-input" required minlength="2" maxlength="60" autocomplete="given-name" /></label><label class="form-label" for="license-last-name">Priezvisko<input id="license-last-name" v-model="licenseLastName" class="form-input" required minlength="2" maxlength="60" autocomplete="family-name" /></label></div>
<div class="mt-6 grid gap-4 sm:grid-cols-2"><label class="form-label">Rola nového člena<select v-model="licenseRole" name="license-role" class="form-input" :disabled="!hasPermission('roles.assign')"><option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option></select></label><label class="form-label">Platnosť licencie<select v-model="licenseLimited" name="license-validity" class="form-input"><option :value="false">Bez časového obmedzenia</option><option :value="true">Do zvoleného dátumu</option></select></label><label v-if="licenseLimited" class="form-label sm:col-span-2">Platná do (vrátane)<input v-model="licenseExpiry" name="license-expiry" class="form-input" type="date" :min="todaySlovakia()" required /></label></div>
<p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><button class="dashboard-primary mt-6" type="submit"><RaceIcon name="flag" /> Vygenerovať číslo</button></form>
      <div v-else class="mt-6"><p class="body-3">{{ generatedLicense.firstName }} {{ generatedLicense.lastName }}</p><MemberLicenseCard :license="generatedLicense" /><label class="form-label mt-6" for="generated-license">Členské licenčné číslo<input id="generated-license" :value="generatedLicense.code" class="form-input license-code font-mono" readonly @focus="($event.target as HTMLInputElement).select()" /></label><p class="body-6 mt-4 text-ink/60">Kód odovzdaj tomuto človeku. Pri registrácii musí zadať zhodné meno a priezvisko. Licencia sa priradí jeho účtu a zostane platná podľa nastaveného obdobia.</p><p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><div class="mt-6 flex flex-wrap gap-3"><button class="dashboard-primary" @click="copyLicense(generatedLicense.code)">Kopírovať číslo</button><button class="dashboard-secondary" @click="openLicenseGenerator">Ďalšia licencia</button><button class="dashboard-secondary" @click="licenseDialog?.close()">Hotovo</button></div></div>
    </dialog>

    <dialog ref="validityDialog" class="member-dialog max-w-lg" aria-labelledby="license-validity-title" @keydown.esc.prevent="validityDialog?.close()"><form @submit.prevent="saveValidity"><h2 id="license-validity-title" class="heading-5">Platnosť členskej licencie</h2><p class="body-6 mt-4 text-ink/60">{{ editingLicense?.firstName }} {{ editingLicense?.lastName }}</p><p class="body-6 mt-2 break-all font-mono">{{ editingLicense?.code }}</p><label class="form-label mt-6">Typ platnosti<select v-model="validityLimited" name="edit-license-validity" class="form-input"><option :value="false">Bez časového obmedzenia</option><option :value="true">Do zvoleného dátumu</option></select></label><label v-if="validityLimited" class="form-label mt-4">Platná do (vrátane)<input v-model="validityDate" name="edit-license-expiry" class="form-input" type="date" :min="todaySlovakia()" required /></label><p class="caption-5 mt-4 text-ink/55">Číslo aj priradený člen zostávajú rovnaké. Dátum platí vrátane celého dňa v časovom pásme Europe/Bratislava.</p><p v-if="validityError" class="form-error mt-4" role="alert">{{ validityError }}</p><div class="mt-6 flex justify-end gap-3"><button type="button" class="dashboard-secondary" @click="validityDialog?.close()">Zrušiť</button><button class="dashboard-primary" type="submit">Uložiť platnosť</button></div></form></dialog>
<dialog ref="confirmation" class="member-dialog max-w-lg" aria-labelledby="confirm-title" @keydown.esc.prevent="confirmation?.close()"><h2 id="confirm-title" class="heading-5">{{ confirmTitle }}</h2><p class="body-6 mt-4 text-ink/65">{{ confirmDescription }}</p><p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><div class="mt-8 flex justify-end gap-3"><button class="dashboard-secondary" autofocus @click="confirmation?.close()">Zrušiť</button><button class="dashboard-primary" @click="confirm">{{ confirmAction === 'reset' ? 'Obnoviť demo' : confirmAction === 'revoke' ? 'Zrušiť licenciu' : 'Odstrániť člena' }}</button></div></dialog>
  </div>
</template>




