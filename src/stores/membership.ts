import { computed, onScopeDispose, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

export type MemberStatus = 'active' | 'pending' | 'inactive'
export type MemberRole = string
export const permissionOptions = [
  { id: 'members.read', name: 'Zobraziť členov', description: 'Členský zoznam a súhrnné prehľady.' },
  { id: 'members.write', name: 'Spravovať členov', description: 'Pridávanie, úprava, schvaľovanie a odstránenie členov.' },
  { id: 'licenses.manage', name: 'Spravovať licencie', description: 'Generovanie licencií a zmena ich platnosti.' },
  { id: 'race.manage', name: 'Spravovať preteky', description: 'Termín, program a informácie o najbližšom podujatí.' },
  { id: 'roles.assign', name: 'Priraďovať roly', description: 'Výber prístupovej roly pre členov a nové licencie.' },
  { id: 'roles.manage', name: 'Spravovať roly', description: 'Tvorba a úprava rolí, oprávnenia a nastavenia dema.' },
] as const
export type Permission = typeof permissionOptions[number]['id']
export interface ClubRole { id: string; name: string; description: string; permissions: Permission[]; protected: boolean }
const defaultRoles = (): ClubRole[] => [
  { id: 'admin', name: 'Správca', description: 'Úplný prístup k správe združenia.', permissions: permissionOptions.map(permission => permission.id), protected: true },
  { id: 'member', name: 'Člen', description: 'Vlastný profil, členská licencia a informácie o klube.', permissions: [], protected: true },
  { id: 'rider', name: 'Jazdec', description: 'Člen klubu, ktorý sa venuje jazdeniu a pretekom.', permissions: [], protected: false },
  { id: 'volunteer', name: 'Dobrovoľník', description: 'Pomáha s organizáciou a klubovými aktivitami.', permissions: [], protected: false },
  { id: 'supporter', name: 'Podporovateľ', description: 'Podporuje klub a komunitu motokrosu.', permissions: [], protected: false },
]
export interface Member {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  status: MemberStatus
  role: MemberRole
  joinedAt: string
  feePaid: boolean
  number: string
}
export type MemberInput = Omit<Member, 'id' | 'joinedAt'>
export interface MemberLicense {
  id: string
  code: string
  firstName: string
  lastName: string
  issuedAt: string
  status: 'available' | 'used' | 'revoked'
  memberId: string | null
  validUntil: string | null
  role: MemberRole
}
interface Activity { id: string; text: string; at: string }
interface DemoData { version: 5; members: Member[]; licenses: MemberLicense[]; roles: ClubRole[]; activity: Activity[] }

const DATA_KEY = 'amk-members-demo-v1'
const SESSION_KEY = 'amk-member-session-v1'
const cleanName = (value: string) => value.normalize('NFC').trim().replace(/\s+/g, ' ')
const matchName = (value: string) => cleanName(value).toLocaleLowerCase('sk-SK')
export function todaySlovakia() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key)!.value).join('-')
}
export function licenseExpired(license: MemberLicense) { return !!license.validUntil && license.validUntil < todaySlovakia() }
function validExpiry(value: string | null) { return value === null || (/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value) }
function licenseCode(existing: MemberLicense[] = []) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  do {
    const random = crypto.getRandomValues(new Uint8Array(10))
    const token = [...random].map(value => alphabet[value % alphabet.length]).join('')
    code = `AMK-${new Date().getFullYear()}-${token.slice(0, 5)}-${token.slice(5)}`
  } while (existing.some(license => license.code === code))
  return code
}
export const statusLabels: Record<MemberStatus, string> = { active: 'Aktívny', pending: 'Čaká na schválenie', inactive: 'Neaktívny' }
const legacyRole = (group?: string) => (({ Jazdec: 'rider', Dobrovoľník: 'volunteer', Podporovateľ: 'supporter' } as Record<string, string>)[group ?? ''] ?? 'member')
const seedNames = [
  ['Martin Kováč', 'spravca@amk-demo.example', 'Dobrovoľník', 'admin', 'active', ''],
  ['Tomáš Švec', 'jazdec@amk-demo.example', 'Jazdec', 'member', 'active', '127'],
  ['Lucia Novotná', 'lucia@amk-demo.example', 'Dobrovoľník', 'member', 'active', ''],
  ['Peter Hruška', 'peter@amk-demo.example', 'Jazdec', 'member', 'active', '63'],
  ['Michaela Balážová', 'michaela@amk-demo.example', 'Podporovateľ', 'member', 'pending', ''],
  ['Jakub Polák', 'jakub@amk-demo.example', 'Jazdec', 'member', 'pending', '218'],
  ['Andrej Varga', 'andrej@amk-demo.example', 'Dobrovoľník', 'member', 'active', ''],
  ['Veronika Urbanová', 'veronika@amk-demo.example', 'Podporovateľ', 'member', 'inactive', ''],
]
export const useMembershipStore = defineStore('membership', () => {
  const storageError = ref('')
  function seed(): DemoData {
    const initial: DemoData = {
      version: 5,
      members: seedNames.map((row, index) => ({ id: 'AMK-' + String(index + 1).padStart(3, '0'), firstName: row[0]!.split(' ')[0]!, lastName: row[0]!.split(' ').slice(1).join(' '), name: row[0]!, email: row[1]!, phone: '', role: row[3] === 'admin' ? 'admin' : legacyRole(row[2]), status: row[4] as MemberStatus, number: row[5]!, joinedAt: new Date(Date.now() - (80 - index * 7) * 86400000).toISOString(), feePaid: index < 3 || index === 6 })),
      licenses: [],
      roles: defaultRoles(),
      activity: [{ id: crypto.randomUUID(), text: 'Ukážková členská databáza je pripravená. Nové registrácie vyžadujú licenciu od správcu.', at: new Date().toISOString() }],
    }
    attachMemberLicenses(initial)
    return initial
  }
  function attachMemberLicenses(state: DemoData) {
    for (const member of state.members) {
      if (!state.licenses.some(license => license.memberId === member.id)) state.licenses.push({ id: crypto.randomUUID(), code: licenseCode(state.licenses), firstName: member.firstName, lastName: member.lastName, issuedAt: member.joinedAt, status: 'used', memberId: member.id, validUntil: null, role: member.role })
    }
  }
  function validData(input: unknown): input is DemoData {
    if (!input || typeof input !== 'object') return false
    const data = input as DemoData
    if (data.version !== 5 || !Array.isArray(data.members) || !Array.isArray(data.licenses) || !Array.isArray(data.roles) || !Array.isArray(data.activity)) return false
    if (!data.roles.every(role => role && typeof role.id === 'string' && typeof role.name === 'string' && typeof role.description === 'string' && typeof role.protected === 'boolean' && Array.isArray(role.permissions) && role.permissions.every(permission => permissionOptions.some(option => option.id === permission)))) return false
    if (!data.roles.some(role => role.id === 'admin') || !data.roles.some(role => role.id === 'member') || new Set(data.roles.map(role => role.id)).size !== data.roles.length) return false
    return data.members.every(m => m && typeof m.id === 'string' && typeof m.firstName === 'string' && typeof m.lastName === 'string' && typeof m.name === 'string' && typeof m.email === 'string' && typeof m.phone === 'string' && typeof m.number === 'string' && typeof m.feePaid === 'boolean' && typeof m.joinedAt === 'string' && Number.isFinite(Date.parse(m.joinedAt)) && ['active', 'pending', 'inactive'].includes(m.status) && data.roles.some(role => role.id === m.role))
      && new Set(data.members.map(m => m.id)).size === data.members.length
      && new Set(data.members.map(m => m.email.toLowerCase())).size === data.members.length
      && data.members.some(m => m.role === 'admin' && m.status === 'active')
      && data.licenses.every(l => l && typeof l.id === 'string' && typeof l.code === 'string' && typeof l.firstName === 'string' && typeof l.lastName === 'string' && typeof l.issuedAt === 'string' && Number.isFinite(Date.parse(l.issuedAt)) && ['available', 'used', 'revoked'].includes(l.status) && (l.memberId === null || typeof l.memberId === 'string') && validExpiry(l.validUntil) && data.roles.some(role => role.id === l.role))
      && new Set(data.licenses.map(l => l.code)).size === data.licenses.length
      && data.activity.every(a => a && typeof a.id === 'string' && typeof a.text === 'string' && typeof a.at === 'string')
  }
  function load(): DemoData {
    try {
      const raw = localStorage.getItem(DATA_KEY)
      if (raw) {
        let parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && 'version' in parsed && [1, 2, 3, 4].includes(parsed.version as number)) {
        const old = parsed as unknown as { members: Array<Member & { group?: string }>; licenses?: MemberLicense[]; roles?: ClubRole[]; activity: Activity[] }
        const migratedMembers = old.members.map(member => {
          const { group, ...record } = member
          return { ...record, firstName: member.firstName ?? member.name.split(' ')[0]!, lastName: member.lastName ?? member.name.split(' ').slice(1).join(' '), role: member.role === 'member' ? legacyRole(group) : member.role }
        })
        const migratedRoles = old.roles ? [...old.roles, ...defaultRoles().filter(role => !old.roles!.some(existing => existing.id === role.id))] : defaultRoles()
        parsed = { ...old, version: 5, roles: migratedRoles, members: migratedMembers, licenses: (old.licenses ?? []).map(license => ({ ...license, validUntil: license.validUntil ?? null, role: migratedMembers.find(member => member.id === license.memberId)?.role ?? license.role ?? 'member' })) }
      }
      if (validData(parsed)) { attachMemberLicenses(parsed); return parsed }
        storageError.value = 'Uložené demo údaje sa nepodarilo načítať. Zobrazuje sa nová ukážka.'
      }
      const initial = seed()
      localStorage.setItem(DATA_KEY, JSON.stringify(initial))
      return initial
    } catch {
      storageError.value = 'Úložisko prehliadača nie je dostupné. Zmeny sa nedajú uložiť.'
      return seed()
    }
  }
  const data = ref<DemoData>(load())
  const sessionId = ref<string | null>(null)
  try { sessionId.value = sessionStorage.getItem(SESSION_KEY) } catch { /* The demo remains available without a saved session. */ }
  const currentMember = computed(() => data.value.members.find(m => m.id === sessionId.value) ?? null)
  const currentLicense = computed(() => data.value.licenses.find(license => license.memberId === currentMember.value?.id) ?? null)
  const isAdmin = computed(() => currentMember.value?.role === 'admin' && currentMember.value.status === 'active')
  const roles = computed(() => data.value.roles)
  const currentRole = computed(() => roles.value.find(role => role.id === currentMember.value?.role) ?? null)
  function hasPermission(permission: string) { return currentMember.value?.status === 'active' && !!currentRole.value?.permissions.some(value => value === permission) }
  const isStaff = computed(() => currentMember.value?.status === 'active' && !!currentRole.value?.permissions.length)
  function roleName(id: string) { return roles.value.find(role => role.id === id)?.name ?? 'Neznáma rola' }
  const members = computed(() => data.value.members)
  const activity = computed(() => data.value.activity)
  const licenses = computed(() => data.value.licenses)

  function commit(next: DemoData, text: string) {
    next.activity = [{ id: crypto.randomUUID(), text, at: new Date().toISOString() }, ...next.activity].slice(0, 40)
    try { localStorage.setItem(DATA_KEY, JSON.stringify(next)) }
    catch { throw new Error('Zmeny sa nepodarilo uložiť. Povoľ úložisko prehliadača a skús to znova.') }
    data.value = next
    storageError.value = ''
  }
  function requireAdmin() { if (!isAdmin.value) throw new Error('Táto akcia je dostupná iba správcovi demo databázy.') }
  function requirePermission(permission: Permission) { if (!hasPermission(permission)) throw new Error('Tvoja rola nemá oprávnenie na túto akciu.') }
  function validate(input: MemberInput, exceptId?: string): MemberInput {
    const clean: MemberInput = { firstName: cleanName(input.firstName), lastName: cleanName(input.lastName), name: cleanName(input.firstName) + ' ' + cleanName(input.lastName), email: input.email.trim().toLowerCase(), phone: input.phone.trim(), number: input.number.trim(), role: input.role, status: input.status, feePaid: input.feePaid }
    if (clean.firstName.length < 2 || clean.lastName.length < 2) throw new Error('Zadaj meno aj priezvisko, každé aspoň s 2 znakmi.')
    if (clean.name.length < 3 || clean.name.length > 100) throw new Error('Zadaj meno a priezvisko v rozsahu 3 až 100 znakov.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) throw new Error('Zadaj platnú emailovú adresu.')
    if (members.value.some(m => m.email.toLowerCase() === clean.email && m.id !== exceptId)) throw new Error('Člen s touto emailovou adresou už existuje.')
    if (!['active', 'pending', 'inactive'].includes(clean.status) || !roles.value.some(role => role.id === clean.role)) throw new Error('Neplatný stav alebo rola člena.')
    if (clean.phone.length > 30 || clean.number.length > 8) throw new Error('Telefón alebo štartové číslo je príliš dlhé.')
    return clean
  }
  function nextData(): DemoData { return JSON.parse(JSON.stringify(data.value)) as DemoData }
  function setSession(id: string | null) {
    sessionId.value = id
    try { if (id) sessionStorage.setItem(SESSION_KEY, id); else sessionStorage.removeItem(SESSION_KEY) } catch { /* Session is held in memory if sessionStorage is unavailable. */ }
  }
  function login(email: string) {
    const member = members.value.find(m => m.email.toLowerCase() === email.trim().toLowerCase())
    if (!member) throw new Error('Tento email nie je v demo databáze. Zaregistruj sa alebo použi ukážkový účet.')
    if (member.status === 'inactive') throw new Error('Toto členstvo je neaktívne. Použi iný demo účet alebo požiadaj správcu o aktiváciu.')
    setSession(member.id)
  }
  function loginDemo(role: MemberRole) {
    const member = members.value.find(m => m.status === 'active' && (role === 'member' ? !roles.value.find(item => item.id === m.role)?.permissions.length : m.role === role))
    if (!member) throw new Error('Aktívny ukážkový účet pre túto rolu nie je dostupný.')
    setSession(member.id)
  }
  function verifyLicense(code: string, firstName: string, lastName: string): MemberLicense {
    if (!cleanName(firstName) || !cleanName(lastName)) throw new Error('Zadaj meno aj priezvisko uvedené na licencii.')
    const license = licenses.value.find(l => l.code === code.trim().toUpperCase())
    if (!license) throw new Error('Licenčné číslo nie je platné. Vyžiadaj si správny kód od správcu klubu.')
    if (license.status === 'revoked') throw new Error('Táto licencia bola zrušená. Kontaktuj správcu klubu.')
    if (license.status === 'used') throw new Error('Táto licencia už bola použitá na registráciu. Prihlás sa existujúcim emailom.')
    if (licenseExpired(license)) throw new Error('Platnosť tejto licencie vypršala. Požiadaj správcu o predĺženie.')
    if (matchName(license.firstName) !== matchName(firstName) || matchName(license.lastName) !== matchName(lastName)) throw new Error('Meno a priezvisko sa nezhodujú s licenciou. Zadaj ich presne vrátane diakritiky.')
    return license
  }
  function issueLicense(firstName: string, lastName: string, options: { validUntil: string | null; role: MemberRole } = { validUntil: null, role: 'member' }) {
    requirePermission('licenses.manage')
    const first = cleanName(firstName), last = cleanName(lastName)
    if (first.length < 2 || last.length < 2 || first.length > 60 || last.length > 60) throw new Error('Meno aj priezvisko musia mať 2 až 60 znakov.')
    if (!validExpiry(options.validUntil) || (options.validUntil && options.validUntil < todaySlovakia())) throw new Error('Platnosť licencie musí byť dnešný alebo budúci dátum.')
    if (!roles.value.some(role => role.id === options.role)) throw new Error('Vyber platnú rolu člena.')
    if (options.role !== 'member') requirePermission('roles.assign')
    if (licenses.value.some(l => l.status === 'available' && matchName(l.firstName) === matchName(first) && matchName(l.lastName) === matchName(last))) throw new Error('Pre toto meno už existuje nepoužitá licencia. Skopíruj existujúci kód alebo ho najprv zruš.')
    const next = nextData()
    const license: MemberLicense = { id: crypto.randomUUID(), code: licenseCode(next.licenses), firstName: first, lastName: last, issuedAt: new Date().toISOString(), status: 'available', memberId: null, validUntil: options.validUntil, role: options.role }
    next.licenses.unshift(license)
    commit(next, `${first} ${last}: registračná licencia bola vygenerovaná.`)
    return license
  }
  function revokeLicense(id: string) {
    requirePermission('licenses.manage')
    const license = licenses.value.find(l => l.id === id)
    if (!license || license.status !== 'available') throw new Error('Zrušiť možno iba nepoužitú licenciu.')
    const next = nextData()
    next.licenses = next.licenses.map(l => l.id === id ? { ...l, status: 'revoked' } : l)
    commit(next, `${license.firstName} ${license.lastName}: registračná licencia bola zrušená.`)
  }
  function updateLicenseValidity(id: string, validUntil: string | null) {
    requirePermission('licenses.manage')
    const license = licenses.value.find(l => l.id === id)
    if (!license || license.status === 'revoked') throw new Error('Zrušenú alebo neexistujúcu licenciu nemožno predĺžiť.')
    if (!validExpiry(validUntil) || (validUntil && validUntil < todaySlovakia())) throw new Error('Vyber dnešný alebo budúci dátum, prípadne trvalú platnosť.')
    const next = nextData()
    next.licenses = next.licenses.map(l => l.id === id ? { ...l, validUntil } : l)
    commit(next, `${license.firstName} ${license.lastName}: platnosť licencie bola aktualizovaná.`)
  }
  function createMember(input: MemberInput, registration?: { code: string; firstName: string; lastName: string }, validity: string | null = null) {
    if (!registration) { requirePermission('members.write'); if (input.role !== 'member') requirePermission('roles.assign') }
    const license = registration ? verifyLicense(registration.code, registration.firstName, registration.lastName) : null
    const clean = validate(registration && license ? { ...input, firstName: cleanName(registration.firstName), lastName: cleanName(registration.lastName), phone: '', number: '', role: license.role, status: 'pending', feePaid: false } : input)
    if (!validExpiry(validity) || (validity && validity < todaySlovakia())) throw new Error('Platnosť licencie musí byť dnešný alebo budúci dátum.')
    const next = nextData()
    const id = 'AMK-' + crypto.randomUUID().slice(0, 8).toUpperCase()
    next.members.unshift({ ...clean, id, joinedAt: new Date().toISOString() })
    if (license) next.licenses = next.licenses.map(l => l.id === license.id ? { ...l, status: 'used', memberId: id } : l)
    else next.licenses.unshift({ id: crypto.randomUUID(), code: licenseCode(next.licenses), firstName: clean.firstName, lastName: clean.lastName, issuedAt: new Date().toISOString(), status: 'used', memberId: id, validUntil: validity, role: clean.role })
    commit(next, `${clean.name}: ${registration ? 'nová žiadosť o členstvo' : 'člen bol pridaný'}.`)
    if (registration) setSession(id)
    return id
  }
  function updateMember(id: string, input: MemberInput) {
    const original = members.value.find(m => m.id === id)
    if (!original) throw new Error('Člen sa nenašiel. Obnov stránku.')
    if (!hasPermission('members.write') && currentMember.value?.id !== id) throw new Error('Nemáš prístup k údajom tohto člena.')
    if (hasPermission('members.write') && input.role !== original.role) requirePermission('roles.assign')
    const safe = hasPermission('members.write') ? input : { ...input, firstName: original.firstName, lastName: original.lastName, name: original.name, role: original.role, status: original.status, feePaid: original.feePaid }
    const clean = validate(safe, id)
    if (original.role === 'admin' && original.status === 'active' && (clean.role !== 'admin' || clean.status !== 'active') && members.value.filter(m => m.role === 'admin' && m.status === 'active').length <= 1) throw new Error('V demo databáze musí zostať aspoň jeden aktívny správca.')
    const next = nextData()
    next.members = next.members.map(m => m.id === id ? { ...m, ...clean } : m)
    next.licenses = next.licenses.map(l => l.memberId === id ? { ...l, firstName: clean.firstName, lastName: clean.lastName, role: clean.role } : l)
    commit(next, `${clean.name}: členské údaje boli aktualizované.`)
  }
  function removeMember(id: string) {
    requirePermission('members.write')
    if (id === currentMember.value?.id) throw new Error('Svoj aktuálne prihlásený účet nemôžeš odstrániť.')
    const member = members.value.find(m => m.id === id)
    if (!member) throw new Error('Člen sa nenašiel.')
    const next = nextData()
    next.members = next.members.filter(m => m.id !== id)
    if (!next.members.some(m => m.role === 'admin' && m.status === 'active')) throw new Error('Musí zostať aspoň jeden aktívny správca.')
    commit(next, `${member.name}: člen bol odstránený z demo databázy.`)
  }
  function resetDemo() {
    requireAdmin()
    const next = seed()
    commit(next, 'Ukážkové údaje boli obnovené.')
    setSession(next.members[0]!.id)
  }
  function logout() { setSession(null) }
  function saveRole(input: { id?: string; name: string; description: string; permissions: Permission[] }) {
    requirePermission('roles.manage')
    const name = cleanName(input.name)
    if (name.length < 2 || name.length > 60) throw new Error('Názov roly musí mať 2 až 60 znakov.')
    if (input.id === 'admin') throw new Error('Základnú rolu správcu nemožno meniť.')
    if (roles.value.some(role => matchName(role.name) === matchName(name) && role.id !== input.id)) throw new Error('Rola s týmto názvom už existuje.')
    if (!input.permissions.every(permission => permissionOptions.some(option => option.id === permission))) throw new Error('Vyber iba platné oprávnenia.')
    const next = nextData()
    const existing = input.id ? next.roles.find(role => role.id === input.id) : null
    if (input.id && !existing) throw new Error('Rola sa nenašla.')
    const role: ClubRole = { id: existing?.id ?? 'role-' + crypto.randomUUID(), name, description: input.description.trim().slice(0, 500), permissions: [...new Set(input.permissions)], protected: existing?.protected ?? false }
    if (existing) next.roles = next.roles.map(item => item.id === role.id ? role : item)
    else next.roles.push(role)
    commit(next, `Rola ${name}: oprávnenia boli uložené.`)
    return role
  }
  function deleteRole(id: string) {
    requirePermission('roles.manage')
    const role = roles.value.find(item => item.id === id)
    if (!role || role.protected) throw new Error('Základné roly nemožno odstrániť.')
    if (members.value.some(member => member.role === id) || licenses.value.some(license => license.role === id && license.status === 'available')) throw new Error('Rola je priradená členom alebo nepoužitým licenciám. Najprv ich preraď alebo zruš licencie.')
    const next = nextData()
    next.roles = next.roles.filter(item => item.id !== id)
    next.licenses = next.licenses.map(license => license.role === id ? { ...license, role: 'member' } : license)
    commit(next, `Rola ${role.name}: bola odstránená.`)
  }

  function onStorage(event: StorageEvent) {
    if (event.key !== DATA_KEY || !event.newValue) return
    try {
      const next: unknown = JSON.parse(event.newValue)
      if (validData(next)) data.value = next
    } catch { storageError.value = 'Údaje v inej karte sa nepodarilo načítať. Obnov túto stránku.' }
  }
  window.addEventListener('storage', onStorage)
  onScopeDispose(() => window.removeEventListener('storage', onStorage))

  return { data, sessionId, members, licenses, roles, currentRole, activity, currentMember, currentLicense, isAdmin, isStaff, storageError, hasPermission, roleName, login, loginDemo, logout, createMember, updateMember, removeMember, resetDemo, verifyLicense, issueLicense, revokeLicense, updateLicenseValidity, saveRole, deleteRole }
})

export function useMembership() {
  const store = useMembershipStore()
  return { ...storeToRefs(store), hasPermission: store.hasPermission, roleName: store.roleName, login: store.login, loginDemo: store.loginDemo, logout: store.logout, createMember: store.createMember, updateMember: store.updateMember, removeMember: store.removeMember, resetDemo: store.resetDemo, verifyLicense: store.verifyLicense, issueLicense: store.issueLicense, revokeLicense: store.revokeLicense, updateLicenseValidity: store.updateLicenseValidity, saveRole: store.saveRole, deleteRole: store.deleteRole }
}
