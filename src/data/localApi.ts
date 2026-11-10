import type { ClubRole, Member, MemberLicense, Permission } from '../stores/membership'
import type { RaceConfiguration } from '../stores/race'

// This module is loaded only in development. It never calls the backend.
const storageKey = 'amk:local-data:v1'
const sessionKey = 'amk:local-session:v1'
const demoPassword = 'local-demo-2026'
const permissions: Permission[] = ['members.read', 'members.write', 'licenses.manage', 'race.manage', 'roles.assign', 'roles.manage']
interface LocalData {
  members: Member[]
  licenses: MemberLicense[]
  roles: ClubRole[]
  activity: { id: string; text: string; at: string }[]
  race: RaceConfiguration
  raceVersion: number
  passwords: Record<string, string>
  resets: Record<string, string>
}
const now = () => new Date().toISOString()
const id = () => crypto.randomUUID()
const reply = (data: unknown, status = 200, headers?: HeadersInit) =>
  new Response(status === 204 ? null : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } })
const error = (status: number, message: string) => reply({ error: { code: 'LOCAL_DATA_ERROR', message } }, status)

function seed(): LocalData {
  const joinedAt = now()
  const members: Member[] = [
    { id: 'local-admin', firstName: 'Demo', lastName: 'Správca', name: 'Demo Správca', email: 'admin@example.test', phone: '', status: 'active', role: 'admin', joinedAt, feePaid: true, number: '1' },
    { id: 'local-member', firstName: 'Demo', lastName: 'Jazdec', name: 'Demo Jazdec', email: 'member@example.test', phone: '', status: 'active', role: 'member', joinedAt, feePaid: true, number: '27' },
    { id: 'local-pending', firstName: 'Demo', lastName: 'Žiadateľ', name: 'Demo Žiadateľ', email: 'pending@example.test', phone: '', status: 'pending', role: 'member', joinedAt, feePaid: false, number: '' },
  ]
  return {
    members,
    licenses: members.map((member, index) => ({ id: `local-license-${index}`, code: `AMK-LOCAL-0000${index + 1}`, firstName: member.firstName, lastName: member.lastName, issuedAt: joinedAt, status: 'used', memberId: member.id, validUntil: null, role: member.role })),
    roles: [
      { id: 'admin', name: 'Správca', description: 'Správa klubu', permissions: [...permissions], protected: true },
      { id: 'member', name: 'Člen', description: 'Členský profil a licencia', permissions: [], protected: false },
    ],
    activity: [{ id: id(), text: 'Lokálne ukážkové údaje boli pripravené.', at: joinedAt }],
    race: {
      name: 'Motokros Veľký Klíž', series: 'Klubové preteky', startsAt: `${new Date().getFullYear() + 1}-05-16T07:00:00.000Z`,
      location: 'Veľký Klíž', address: 'Motokrosový areál, Veľký Klíž', description: 'Ukážkové klubové preteky pre lokálny vývoj.',
      confirmed: true, registrationOpen: false, registrationUrl: '', categories: 'MX1, MX2, Hobby', riderFee: '30 €', spectatorFee: '5 €',
      requirements: 'Prilba a ochranná výstroj.', parking: 'Parkovanie pri areáli.', contactEmail: 'club@example.test', contactPhone: '',
      schedule: [{ id: 'local-training', title: 'Tréning', time: '09:00', description: 'Voľné tréningy' }, { id: 'local-start', title: 'Preteky', time: '11:00', description: 'Štart prvej jazdy' }],
    },
    raceVersion: 1,
    passwords: Object.fromEntries(members.map(member => [member.id, demoPassword])),
    resets: {},
  }
}
function load(): LocalData {
  const saved = localStorage.getItem(storageKey)
  if (saved) return JSON.parse(saved) as LocalData
  const data = seed()
  localStorage.setItem(storageKey, JSON.stringify(data))
  return data
}

export async function localApiResponse(path: string, options: RequestInit = {}): Promise<Response> {
  const data = load()
  const method = (options.method ?? 'GET').toUpperCase()
  const body = (typeof options.body === 'string' ? JSON.parse(options.body) : {}) as Record<string, unknown>
  const value = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : ''
  const email = () => value('email').toLowerCase()
  const save = (result: unknown, status = 200, headers?: HeadersInit) => {
    localStorage.setItem(storageKey, JSON.stringify(data))
    return reply(result, status, headers)
  }
  const log = (text: string) => data.activity.unshift({ id: id(), text, at: now() })
  const me = data.members.find(member => member.id === sessionStorage.getItem(sessionKey))
  const granted = me?.status === 'active' ? data.roles.find(role => role.id === me.role)?.permissions ?? [] : []
  const can = (permission: Permission) => granted.includes(permission)
  const roleExists = (role: string) => data.roles.some(item => item.id === role)
  const duplicateEmail = (exceptId?: string) => data.members.some(member => member.id !== exceptId && member.email.toLowerCase() === email())
  const newLicense = (firstName: string, lastName: string, role: string, memberId: string | null = null): MemberLicense => ({
    id: id(), code: `AMK-LOCAL-${id().replaceAll('-', '').slice(0, 10).toUpperCase()}`, firstName, lastName, role, memberId,
    issuedAt: now(), status: memberId ? 'used' : 'available', validUntil: value('validUntil') || null,
  })
  const checkLicense = () => data.licenses.find(license =>
    license.code === value('code').toUpperCase() && license.firstName === value('firstName') && license.lastName === value('lastName') &&
    license.status === 'available' && (!license.validUntil || license.validUntil >= new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bratislava' }).format(new Date())))

  if (path === '/race' && method === 'GET') return reply(data.race, 200, { ETag: `"${data.raceVersion}"` })
  if (path === '/auth/sign-in/email' && method === 'POST') {
    const member = data.members.find(item => item.email.toLowerCase() === email())
    if (!member || data.passwords[member.id] !== body.password || member.status === 'inactive') return error(401, 'Nesprávny email alebo heslo.')
    sessionStorage.setItem(sessionKey, member.id)
    return reply({ member })
  }
  if (path === '/auth/sign-out' && method === 'POST') {
    sessionStorage.removeItem(sessionKey)
    return reply(null, 204)
  }
  if (path === '/licenses/check' && method === 'POST') return checkLicense() ? reply({ valid: true }) : error(400, 'Licencia nie je platná pre zadané meno.')
  if (path === '/register' && method === 'POST') {
    const license = checkLicense()
    if (!license) return error(400, 'Licencia nie je platná pre zadané meno.')
    if (!email() || value('password').length < 12) return error(400, 'Zadajte email a heslo s aspoň 12 znakmi.')
    if (duplicateEmail()) return error(409, 'Tento email už používa iný člen.')
    const member: Member = { id: id(), firstName: license.firstName, lastName: license.lastName, name: `${license.firstName} ${license.lastName}`, email: email(), phone: '', number: '', status: 'pending', role: license.role, joinedAt: now(), feePaid: false }
    data.members.push(member)
    data.passwords[member.id] = body.password as string
    license.memberId = member.id; license.status = 'used'
    log(`Nová žiadosť: ${member.name}`)
    return save({ message: 'Lokálna registrácia je dokončená. Môžete sa prihlásiť; schválenie vykoná správca.' })
  }
  if (path === '/auth/send-verification-email' && method === 'POST') return reply({ message: 'Lokálne účty nevyžadujú overenie emailu.' })
  if (path === '/auth/request-password-reset' && method === 'POST') {
    const member = data.members.find(item => item.email.toLowerCase() === email())
    if (member) {
      const token = id()
      data.resets[token] = member.id
      console.info(`Lokálne obnovenie hesla: ${location.origin}/obnova-hesla?token=${token}`)
    }
    return save({ message: 'Odkaz na lokálne obnovenie hesla je v konzole prehliadača.' })
  }
  if (path === '/auth/reset-password' && method === 'POST') {
    const memberId = data.resets[value('token')]
    if (!memberId || value('newPassword').length < 12) return error(400, 'Neplatný token alebo príliš krátke heslo.')
    data.passwords[memberId] = body.newPassword as string
    delete data.resets[value('token')]
    return save({ success: true })
  }

  if (!me || me.status === 'inactive') return error(401, 'Prihláste sa do členskej zóny.')
  if (path === '/me' && method === 'GET') return reply({ member: me, license: data.licenses.find(license => license.memberId === me.id) ?? null, permissions: granted })
  if (path === '/me' && method === 'PATCH') {
    me.phone = value('phone'); me.number = value('number')
    return save(me)
  }
  if (path === '/roles' && method === 'GET') return reply(data.roles)
  if (path === '/members' && method === 'GET') return can('members.read') || can('members.write') ? reply(data.members) : error(403, 'Nemáte oprávnenie zobraziť členov.')
  if (path === '/licenses' && method === 'GET') return can('licenses.manage') ? reply(data.licenses) : error(403, 'Nemáte oprávnenie spravovať licencie.')
  if (path === '/activity' && method === 'GET') return can('members.read') ? reply(data.activity) : error(403, 'Nemáte oprávnenie zobraziť aktivitu.')
  if (path === '/race' && method === 'PUT') {
    if (!can('race.manage')) return error(403, 'Nemáte oprávnenie spravovať preteky.')
    if (new Headers(options.headers).get('If-Match') !== `"${data.raceVersion}"`) return error(412, 'Preteky sa zmenili. Obnovte stránku.')
    data.race = body as unknown as RaceConfiguration
    data.raceVersion++
    log('Nastavenia pretekov boli uložené.')
    return save(data.race, 200, { ETag: `"${data.raceVersion}"` })
  }
  if (path === '/members' && method === 'POST') {
    if (!can('members.write')) return error(403, 'Nemáte oprávnenie spravovať členov.')
    const role = can('roles.assign') ? value('role') || 'member' : 'member'
    if (!roleExists(role) || !email() || !value('firstName') || !value('lastName')) return error(400, 'Vyplňte meno, email a platnú rolu.')
    if (duplicateEmail()) return error(409, 'Tento email už používa iný člen.')
    const member: Member = { id: id(), firstName: value('firstName'), lastName: value('lastName'), name: `${value('firstName')} ${value('lastName')}`, email: email(), phone: value('phone'), number: value('number'), status: (value('status') || 'active') as Member['status'], role, joinedAt: now(), feePaid: body.feePaid === true }
    data.members.push(member)
    data.passwords[member.id] = demoPassword
    data.licenses.push(newLicense(member.firstName, member.lastName, role, member.id))
    log(`Pridaný člen: ${member.name}`)
    return save(member, 201)
  }
  const memberMatch = path.match(/^\/members\/([^/]+)$/)
  if (memberMatch && (method === 'PATCH' || method === 'DELETE')) {
    if (!can('members.write')) return error(403, 'Nemáte oprávnenie spravovať členov.')
    const member = data.members.find(item => item.id === decodeURIComponent(memberMatch[1]!))
    if (!member) return error(404, 'Člen neexistuje.')
    if (member.id === 'local-admin' && (method === 'DELETE' || value('role') !== 'admin' || value('status') !== 'active')) return error(400, 'Ukážkový správca musí zostať aktívny.')
    if (method === 'DELETE') {
      if (member.id === me.id) return error(400, 'Nemôžete odstrániť vlastný účet.')
      data.members = data.members.filter(item => item.id !== member.id)
      delete data.passwords[member.id]
      data.licenses.filter(license => license.memberId === member.id).forEach(license => { license.memberId = null; license.status = 'revoked' })
      log(`Odstránený člen: ${member.name}`)
      return save(null, 204)
    }
    const role = can('roles.assign') ? value('role') || member.role : member.role
    if (!roleExists(role)) return error(400, 'Rola neexistuje.')
    member.firstName = value('firstName'); member.lastName = value('lastName'); member.name = `${member.firstName} ${member.lastName}`
    member.phone = value('phone'); member.number = value('number'); member.role = role
    member.status = (value('status') || member.status) as Member['status']; member.feePaid = body.feePaid === true
    data.licenses.filter(license => license.memberId === member.id).forEach(license => { license.firstName = member.firstName; license.lastName = member.lastName; license.role = role })
    log(`Upravený člen: ${member.name}`)
    return save(member)
  }
  if (path === '/licenses' && method === 'POST') {
    if (!can('licenses.manage')) return error(403, 'Nemáte oprávnenie spravovať licencie.')
    const role = can('roles.assign') ? value('role') || 'member' : 'member'
    if (!roleExists(role) || !value('firstName') || !value('lastName')) return error(400, 'Vyplňte meno a platnú rolu.')
    const license = newLicense(value('firstName'), value('lastName'), role)
    data.licenses.push(license)
    log(`Vydaná licencia: ${license.firstName} ${license.lastName}`)
    return save(license, 201)
  }
  const licenseMatch = path.match(/^\/licenses\/([^/]+)(\/revoke)?$/)
  if (licenseMatch && (method === 'PATCH' || method === 'POST' && licenseMatch[2])) {
    if (!can('licenses.manage')) return error(403, 'Nemáte oprávnenie spravovať licencie.')
    const license = data.licenses.find(item => item.id === decodeURIComponent(licenseMatch[1]!))
    if (!license) return error(404, 'Licencia neexistuje.')
    if (method === 'POST') license.status = 'revoked'
    else license.validUntil = value('validUntil') || null
    return save(license)
  }
  const roleMatch = path.match(/^\/roles\/([^/]+)$/)
  if (path === '/roles' && method === 'POST' || roleMatch && (method === 'PUT' || method === 'DELETE')) {
    if (!can('roles.manage')) return error(403, 'Nemáte oprávnenie spravovať roly.')
    const role = roleMatch ? data.roles.find(item => item.id === decodeURIComponent(roleMatch[1]!)) : undefined
    if (roleMatch && !role) return error(404, 'Rola neexistuje.')
    if (role?.protected) return error(400, 'Základnú rolu správcu nemožno meniť.')
    if (method === 'DELETE' && role) {
      if (role.id === 'member' || data.members.some(member => member.role === role.id) || data.licenses.some(license => license.role === role.id && license.status === 'available')) return error(409, 'Rola sa používa a nemožno ju odstrániť.')
      data.roles = data.roles.filter(item => item.id !== role.id)
      return save(null, 204)
    }
    if (!value('name')) return error(400, 'Zadajte názov roly.')
    const requestedPermissions: unknown[] = Array.isArray(body.permissions) ? body.permissions : []
    const input = { name: value('name'), description: value('description'), permissions: permissions.filter(permission => requestedPermissions.includes(permission)) }
    if (role) Object.assign(role, input)
    else data.roles.push({ id: id(), ...input, protected: false })
    return save(role ?? data.roles.at(-1), role ? 200 : 201)
  }
  return error(404, `Lokálna požiadavka nie je podporovaná: ${method} ${path}`)
}
