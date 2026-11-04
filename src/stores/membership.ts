import { computed, onScopeDispose, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { api, ApiError, json } from '../api'
export type MemberStatus = 'active' | 'pending' | 'inactive'
export type MemberRole = string
export const permissionOptions = [
  { id: 'members.read', name: 'Zobraziť členov', description: 'Členský zoznam a súhrnné prehľady.' },
  { id: 'members.write', name: 'Spravovať členov', description: 'Pridávanie, úprava, schvaľovanie a odstránenie členov.' },
  { id: 'licenses.manage', name: 'Spravovať licencie', description: 'Generovanie licencií a zmena ich platnosti.' },
  { id: 'race.manage', name: 'Spravovať preteky', description: 'Termín, program a informácie o najbližšom podujatí.' },
  { id: 'roles.assign', name: 'Priraďovať roly', description: 'Výber prístupovej roly pre členov a nové licencie.' },
  { id: 'roles.manage', name: 'Spravovať roly', description: 'Tvorba a úprava rolí a oprávnení.' },
] as const
export type Permission = typeof permissionOptions[number]['id']
export interface ClubRole { id: string; name: string; description: string; permissions: Permission[]; protected: boolean }
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

export function todaySlovakia() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key)!.value).join('-')
}
export function licenseExpired(license: MemberLicense) { return !!license.validUntil && license.validUntil < todaySlovakia() }
export const statusLabels: Record<MemberStatus, string> = { active: 'Aktívny', pending: 'Čaká na schválenie', inactive: 'Neaktívny' }
const inputOf = (m: MemberInput) => ({ firstName: m.firstName, lastName: m.lastName, email: m.email, phone: m.phone, number: m.number, status: m.status, role: m.role, feePaid: m.feePaid })
export const useMembershipStore = defineStore('membership', () => {
  const members = ref<Member[]>([]), licenses = ref<MemberLicense[]>([]), roles = ref<ClubRole[]>([]), activity = ref<Activity[]>([])
  const currentMember = ref<Member | null>(null), currentLicense = ref<MemberLicense | null>(null)
  const granted = ref<Permission[]>([]), storageError = ref(''), loading = ref(false), busy = ref(false), initialized = ref(false)
  const currentRole = computed(() => roles.value.find(r => r.id === currentMember.value?.role) ?? null)
  const isAdmin = computed(() => currentMember.value?.role === 'admin' && granted.value.includes('roles.manage'))
  const isStaff = computed(() => granted.value.length > 0)
  const hasPermission = (permission: string) => granted.value.some(p => p === permission)
  const roleName = (id: string) => roles.value.find(r => r.id === id)?.name ?? 'Člen'
  function clear() { currentMember.value = null; currentLicense.value = null; members.value = []; licenses.value = []; roles.value = []; activity.value = []; granted.value = [] }
  async function refresh() {
    let me: { member: Member; license: MemberLicense | null; permissions: Permission[] }
    try { me = await api('/me') }
    catch (error) { if (error instanceof ApiError && error.status === 401) { clear(); return }; throw error }
    currentMember.value = me.member; currentLicense.value = me.license; granted.value = me.permissions
    members.value = [me.member]; licenses.value = me.license ? [me.license] : []; activity.value = []
    const [roleList, memberList, licenseList, logs] = await Promise.all([
      api<ClubRole[]>('/roles'),
      me.permissions.some(p => ['members.read', 'members.write'].includes(p)) ? api<Member[]>('/members') : Promise.resolve([me.member]),
      me.permissions.includes('licenses.manage') ? api<MemberLicense[]>('/licenses') : Promise.resolve(me.license ? [me.license] : []),
      me.permissions.includes('members.read') ? api<Activity[]>('/activity') : Promise.resolve([]),
    ])
    roles.value = roleList; members.value = memberList; licenses.value = licenseList; activity.value = logs; storageError.value = ''
  }
  let pending: Promise<void> | null = null
  async function initialize(force = false) {
    if (pending) return pending
    if (initialized.value && !force) return
    loading.value = true
    pending = refresh().catch(error => { clear(); storageError.value = error instanceof Error ? error.message : 'Údaje sa nepodarilo načítať.' })
      .finally(() => { initialized.value = true; loading.value = false; pending = null })
    return pending
  }
  async function mutate<T>(operation: () => Promise<T>) {
    if (busy.value) throw new Error('Počkajte na dokončenie predchádzajúcej požiadavky.')
    busy.value = true
    try { const result = await operation(); await refresh(); return result }
    finally { busy.value = false }
  }
  async function login(email: string, password: string) {
    await api('/auth/sign-in/email', json('POST', { email, password }))
    await refresh()
  }
  async function register(input: { firstName: string; lastName: string; email: string; password: string; code: string }) { return api<{ message: string }>('/register', json('POST', input)) }
  async function logout() { await api('/auth/sign-out', json('POST', {})); clear() }
  async function verifyLicense(code: string, firstName: string, lastName: string) { return api('/licenses/check', json('POST', { code, firstName, lastName })) }
  async function createMember(input: MemberInput, _registration?: never, validUntil: string | null = null) { return mutate(() => api<Member>('/members', json('POST', { ...inputOf(input), validUntil }))) }
  async function updateMember(id: string, input: MemberInput) { return mutate(() => api<Member>('/members/' + encodeURIComponent(id), json('PATCH', inputOf(input)))) }
  async function updateProfile(input: { phone: string; number: string }) { return mutate(() => api<Member>('/me', json('PATCH', { phone: input.phone, number: input.number }))) }
  async function removeMember(id: string) { return mutate(() => api('/members/' + encodeURIComponent(id), json('DELETE', {}))) }
  async function issueLicense(firstName: string, lastName: string, options = { validUntil: null as string | null, role: 'member' as MemberRole }) { return mutate(() => api<MemberLicense>('/licenses', json('POST', { firstName, lastName, ...options }))) }
  async function revokeLicense(id: string) { return mutate(() => api('/licenses/' + encodeURIComponent(id) + '/revoke', json('POST', {}))) }
  async function updateLicenseValidity(id: string, validUntil: string | null) { return mutate(() => api('/licenses/' + encodeURIComponent(id), json('PATCH', { validUntil }))) }
  async function saveRole(input: { id?: string; name: string; description: string; permissions: Permission[] }) {
    const { id, ...body } = input
    return mutate(() => api<ClubRole>(id ? '/roles/' + encodeURIComponent(id) : '/roles', json(id ? 'PUT' : 'POST', body)))
  }
  async function deleteRole(id: string) { return mutate(() => api('/roles/' + encodeURIComponent(id), json('DELETE', {}))) }
  const onExpired = () => clear()
  const onFocus = () => { if (!busy.value) void initialize(true) }
  window.addEventListener('amk:session-expired', onExpired); window.addEventListener('focus', onFocus)
  onScopeDispose(() => { window.removeEventListener('amk:session-expired', onExpired); window.removeEventListener('focus', onFocus) })
  return { members, licenses, roles, activity, currentMember, currentLicense, currentRole, isAdmin, isStaff, loading, busy, storageError, initialized,
    hasPermission, roleName, initialize, login, register, logout, verifyLicense, createMember, updateMember, updateProfile, removeMember, issueLicense, revokeLicense, updateLicenseValidity, saveRole, deleteRole }
})
export function useMembership() {
  const store = useMembershipStore()
  return { ...storeToRefs(store), hasPermission: store.hasPermission, roleName: store.roleName, initialize: store.initialize,
    login: store.login, register: store.register, logout: store.logout, verifyLicense: store.verifyLicense, createMember: store.createMember,
    updateMember: store.updateMember, updateProfile: store.updateProfile, removeMember: store.removeMember, issueLicense: store.issueLicense,
    revokeLicense: store.revokeLicense, updateLicenseValidity: store.updateLicenseValidity, saveRole: store.saveRole, deleteRole: store.deleteRole }
}
