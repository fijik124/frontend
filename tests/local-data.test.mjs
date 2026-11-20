import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'

function storage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear(),
  }
}

// Exercise the same development entry point as the app with all network access blocked.
const originalFetch = globalThis.fetch
globalThis.localStorage = storage()
globalThis.sessionStorage = storage()
globalThis.window = Object.assign(new EventTarget(), { __API_BASE_URL__: 'invalid-and-must-be-ignored' })
globalThis.location = { origin: 'http://localhost:5173' }
let networkCalls = 0
globalThis.fetch = () => { networkCalls++; throw new Error('Development must never fetch backend data') }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { api, apiResponse, ApiError, json } = await server.ssrLoadModule('/src/api.ts')
after(async () => { await server.close(); globalThis.fetch = originalFetch })
const login = (email = 'admin@example.test', password = 'local-demo-2026') => api('/auth/sign-in/email', json('POST', { email, password }))

test('development keeps all data and workflows local', async t => {
  await t.test('public race loads with an ETag and no backend; protected data needs login', async () => {
    const response = await apiResponse('/race')
    assert.equal(response.headers.get('ETag'), '"1"')
    assert.equal((await response.json()).name, 'Motokros Veľký Klíž')
    await assert.rejects(api('/me'), error => error instanceof ApiError && error.status === 401)
    await assert.rejects(login('admin@example.test', 'wrong'), error => error.status === 401)
  })

  await t.test('administrator can edit data and stale race saves are rejected', async () => {
    await login()
    assert.equal((await api('/me')).permissions.length, 9)
    assert.equal((await api('/members')).length, 3)
    const response = await apiResponse('/race')
    const race = await response.json()
    race.name = 'Locally edited race'
    await api('/race', { ...json('PUT', race), headers: { 'If-Match': response.headers.get('ETag') } })
    assert.equal((await api('/race')).name, race.name)
    await assert.rejects(api('/race', { ...json('PUT', race), headers: { 'If-Match': '"1"' } }), error => error.status === 412)
    assert.equal(JSON.parse(localStorage.getItem('amk:local-data:v1')).race.name, race.name)
  })

  let license
  let registered
  await t.test('license registration, approval and profile editing work locally', async () => {
    license = await api('/licenses', json('POST', { firstName: 'Test', lastName: 'Rider', role: 'member', validUntil: null }))
    await api('/auth/sign-out', json('POST', {}))
    await api('/licenses/check', json('POST', { code: license.code, firstName: 'Test', lastName: 'Rider' }))
    await api('/register', json('POST', { code: license.code, firstName: 'Test', lastName: 'Rider', email: 'rider@example.test', password: 'test-password-2026' }))
    await assert.rejects(api('/licenses/check', json('POST', { code: license.code, firstName: 'Test', lastName: 'Rider' })), error => error.status === 400)
    await login('rider@example.test', 'test-password-2026')
    registered = (await api('/me')).member
    assert.equal(registered.status, 'pending')
    assert.deepEqual((await api('/me')).permissions, [])
    await assert.rejects(api('/members'), error => error.status === 403)
    await api('/me', json('PATCH', { phone: '+421900123456', number: '99', role: 'admin' }))
    assert.equal((await api('/me')).member.role, 'member')
    assert.equal((await api('/me')).member.number, '99')
    await login()
    await api(`/members/${registered.id}`, json('PATCH', { ...registered, status: 'active' }))
    await login('rider@example.test', 'test-password-2026')
    assert.equal((await api('/me')).member.status, 'active')
  })

  await t.test('roles, member creation/deletion, and license management work locally', async () => {
    await login()
    const role = await api('/roles', json('POST', { name: 'Race staff', description: '', permissions: ['race.manage'] }))
    const member = await api('/members', json('POST', { firstName: 'Demo', lastName: 'Staff', email: 'staff@example.test', role: role.id, status: 'active', feePaid: false }))
    assert.ok((await api('/licenses')).some(item => item.memberId === member.id))
    await assert.rejects(api(`/roles/${role.id}`, json('DELETE', {})), error => error.status === 409)
    await login('staff@example.test')
    assert.deepEqual((await api('/me')).permissions, ['race.manage'])
    await assert.rejects(api('/licenses'), error => error.status === 403)
    await login()
    await api(`/members/${member.id}`, json('DELETE', {}))
    await api(`/roles/${role.id}`, json('DELETE', {}))
    await api(`/licenses/${license.id}`, json('PATCH', { validUntil: '2030-12-31' }))
    assert.equal((await api('/licenses')).find(item => item.id === license.id).validUntil, '2030-12-31')
    const spare = await api('/licenses', json('POST', { firstName: 'Test', lastName: 'Unused', role: 'member' }))
    await api(`/licenses/${spare.id}/revoke`, json('POST', {}))
    assert.equal((await api('/licenses')).find(item => item.id === spare.id).status, 'revoked')
  })

  await t.test('password reset is local and tokens are single use', async () => {
    await api('/auth/request-password-reset', json('POST', { email: 'rider@example.test' }))
    const token = Object.keys(JSON.parse(localStorage.getItem('amk:local-data:v1')).resets)[0]
    assert.ok(token)
    await api('/auth/reset-password', json('POST', { token, newPassword: 'changed-local-password' }))
    await assert.rejects(api('/auth/reset-password', json('POST', { token, newPassword: 'another-local-password' })), error => error.status === 400)
    await login('rider@example.test', 'changed-local-password')
  })

  await t.test('unused licenses can be removed, while used licenses stay attached and unusable codes fail registration', async () => {
    await login()
    const unused = await api('/licenses', json('POST', { firstName: 'Unused', lastName: 'License', role: 'member', validUntil: null }))
    const remove = id => api('/licenses/' + id, json('DELETE', {}))
    assert.equal(unused.removable, true)
    await api('/auth/sign-out', json('POST', {}))
    await assert.rejects(remove(unused.id), error => error.status === 401)
    await login('member@example.test')
    await assert.rejects(remove(unused.id), error => error.status === 403)
    await login('pending@example.test')
    await assert.rejects(remove(unused.id), error => error.status === 403)
    await login()
    const assigned = (await api('/licenses')).find(item => item.memberId === 'local-member')
    assert.equal(assigned.removable, false)
    await assert.rejects(remove(assigned.id), error => error.status === 409)
    assert.equal(await remove(unused.id), undefined)
    assert.ok(!(await api('/licenses')).some(item => item.id === unused.id))
    await assert.rejects(api('/licenses/check', json('POST', { code: unused.code, firstName: 'Unused', lastName: 'License' })), error => error.status === 400)
    await assert.rejects(remove(unused.id), error => error.status === 404)
    const revoked = await api('/licenses', json('POST', { firstName: 'Revoked', lastName: 'License', role: 'member', validUntil: null }))
    await api('/licenses/' + revoked.id + '/revoke', json('POST', {}))
    assert.equal((await api('/licenses')).find(item => item.id === revoked.id).removable, true)
    await remove(revoked.id)
    assert.ok(!JSON.parse(localStorage.getItem('amk:local-data:v1')).licenses.some(item => item.id === revoked.id))
  })

  await t.test('training dates stay public when cancelled and edits reject stale versions', async () => {
    await login()
    const input = { title: 'Tréning', startsAt: '2027-05-20T07:00:00.000Z', endsAt: '', location: 'Testovacia trať', meetingPoint: '', notes: 'Vlastná výstroj.', cancelled: false, cancellationReason: '' }
    const training = await api('/trainings', json('POST', input))
    assert.equal(training.version, 1)
    assert.equal(JSON.parse(localStorage.getItem('amk:local-data:v1')).trainings[0].id, training.id)
    const cancelled = await api(`/trainings/${training.id}`, { ...json('PUT', { ...input, cancelled: true, cancellationReason: 'Dážď' }), headers: { 'If-Match': '"1"' } })
    assert.equal(cancelled.version, 2)
    await assert.rejects(api(`/trainings/${training.id}`, { ...json('PUT', input), headers: { 'If-Match': '"1"' } }), error => error.status === 412)
    await assert.rejects(api('/trainings', json('POST', { ...input, endsAt: '2027-05-19T07:00:00.000Z' })), error => error.status === 400)
    await assert.rejects(api('/trainings', json('POST', { ...input, title: ' ' })), error => error.status === 400)
    await assert.rejects(api('/trainings', json('POST', { ...input, startsAt: '2027-02-30T07:00:00.000Z' })), error => error.status === 400)
    await assert.rejects(api('/trainings', json('POST', { ...input, cancelled: 'false' })), error => error.status === 400)
    await api('/auth/sign-out', json('POST', {}))
    assert.equal((await api('/trainings'))[0].cancellationReason, 'Dážď')
    await assert.rejects(api('/trainings', json('POST', input)), error => error.status === 401)
    await login('member@example.test')
    await assert.rejects(api('/trainings', json('POST', input)), error => error.status === 403)
    await login()
    const restored = await api(`/trainings/${training.id}`, { ...json('PUT', { ...input, cancellationReason: 'Old reason' }), headers: { 'If-Match': '"2"' } })
    assert.equal(restored.cancelled, false)
    assert.equal(restored.cancellationReason, '')
  })

  await t.test('training removal requires permission and the current version, and persists publicly', async () => {
    const training = (await api('/trainings'))[0]
    const remove = (version = training.version, id = training.id) => api('/trainings/' + id, { ...json('DELETE', {}), headers: { 'If-Match': JSON.stringify(String(version)) } })
    await api('/auth/sign-out', json('POST', {}))
    await assert.rejects(remove(), error => error.status === 401)
    await login('member@example.test')
    await assert.rejects(remove(), error => error.status === 403)
    await login('pending@example.test')
    await assert.rejects(remove(), error => error.status === 403)
    await login()
    await assert.rejects(remove(training.version - 1), error => error.status === 412)
    await assert.rejects(remove(1, 'missing-training'), error => error.status === 404)
    assert.ok((await api('/trainings')).some(item => item.id === training.id))
    assert.equal(await remove(), undefined)
    assert.ok(!JSON.parse(localStorage.getItem('amk:local-data:v1')).trainings.some(item => item.id === training.id))
    await assert.rejects(remove(), error => error.status === 404)
    await api('/auth/sign-out', json('POST', {}))
    assert.ok(!(await api('/trainings')).some(item => item.id === training.id))
  })

  await t.test('marshal calendar needs separate read/write permissions and never leaks into public dates', async () => {
    await login()
    const input = { title: 'Interné podujatie komisárov', startsAt: '2027-05-21T05:00:00.000Z', endsAt: '', location: 'Súkromné miesto', meetingPoint: 'Vstup pre tím', notes: 'Zraz o 7:00, kontakt na vedúceho tímu.', cancelled: false, cancellationReason: '' }
    const event = await api('/marshal-events', json('POST', input))
    const role = await api('/roles', json('POST', { name: 'Kalendár komisárov', description: '', permissions: ['marshals.read'] }))
    const member = await api('/members', json('POST', { firstName: 'Test', lastName: 'Marshal', email: 'marshal@example.test', role: role.id, status: 'active', feePaid: false }))
    assert.ok(!(await api('/activity')).some(item => item.text.includes(input.title)))
    await login('marshal@example.test')
    assert.equal((await api('/marshal-events'))[0].meetingPoint, input.meetingPoint)
    await assert.rejects(api('/marshal-events', json('POST', input)), error => error.status === 403)
    await assert.rejects(api(`/marshal-events/${event.id}`, { ...json('PUT', input), headers: { 'If-Match': '"1"' } }), error => error.status === 403)
    await login('member@example.test')
    await assert.rejects(api('/marshal-events'), error => error.status === 403)
    await login('pending@example.test')
    await assert.rejects(api('/marshal-events'), error => error.status === 403)
    await api('/auth/sign-out', json('POST', {}))
    await assert.rejects(api('/marshal-events'), error => error.status === 401)
    assert.ok(!(await api('/trainings')).some(item => item.id === event.id || item.notes === input.notes))
    await login()
    const cancelled = await api(`/marshal-events/${event.id}`, { ...json('PUT', { ...input, cancelled: true, cancellationReason: 'Zmena programu' }), headers: { 'If-Match': '"1"' } })
    assert.equal(cancelled.version, 2)
    await assert.rejects(api(`/marshal-events/${event.id}`, { ...json('PUT', input), headers: { 'If-Match': '"1"' } }), error => error.status === 412)
    await api(`/members/${member.id}`, json('DELETE', {}))
  })

  await t.test('older browser data gains calendars without losing existing members or races', async () => {
    const saved = JSON.parse(localStorage.getItem('amk:local-data:v1'))
    delete saved.trainings; delete saved.marshalEvents
    saved.roles.find(role => role.id === 'admin').permissions = saved.roles.find(role => role.id === 'admin').permissions.filter(permission => !permission.startsWith('marshals.') && permission !== 'trainings.manage')
    localStorage.setItem('amk:local-data:v1', JSON.stringify(saved))
    await login()
    assert.ok((await api('/me')).permissions.includes('trainings.manage'))
    assert.deepEqual(await api('/trainings'), [])
    assert.deepEqual(await api('/marshal-events'), [])
    assert.equal((await api('/race')).name, saved.race.name)
    assert.equal((await api('/members')).length, saved.members.length)
  })

  await t.test('unknown requests fail locally; logout clears the session', async () => {
    await assert.rejects(api('/unimplemented'), error => error.status === 404)
    await api('/auth/sign-out', json('POST', {}))
    assert.equal(sessionStorage.getItem('amk:local-session:v1'), null)
    await assert.rejects(api('/me'), error => error.status === 401)
    assert.equal(networkCalls, 0)
  })
})

test('calendar dates use Slovakia time, include cancellations and span days', async () => {
  const { emptyEvent, eventDay, eventsOnDay, monthDays, upcomingEvents } = await server.ssrLoadModule('/src/data/events.ts')
  const { raceIsoDate, raceLocalDate } = await server.ssrLoadModule('/src/stores/race.ts')
  const event = (id, startsAt, endsAt = '', cancelled = false) => ({ ...emptyEvent(), id, version: 1, title: id, location: 'Test', startsAt, endsAt, cancelled })
  const past = event('past', '2027-05-18T07:00:00Z')
  const cancelled = event('cancelled', '2027-05-20T07:00:00Z', '', true)
  const multi = event('multi', '2027-05-19T07:00:00Z', '2027-05-21T07:00:00Z')
  assert.deepEqual(upcomingEvents([cancelled, past, multi], '2027-05-20').map(item => item.id), ['multi', 'cancelled'])
  assert.equal(eventsOnDay([past, cancelled, multi], '2027-05-20').length, 2)
  assert.deepEqual(eventsOnDay([cancelled, multi], '2027-05-20').map(item => item.id), ['multi', 'cancelled'])
  assert.equal(eventDay('2027-05-19T23:00:00Z'), '2027-05-20')
  assert.equal(monthDays('2027-02').length, 28)
  assert.ok(monthDays('2028-02').includes('2028-02-29'))
  assert.equal(monthDays('2027-05')[5], '2027-05-01')
  assert.equal(raceLocalDate(raceIsoDate('2027-05-20T09:00')), '2027-05-20T09:00')
  assert.throws(() => raceIsoDate('2027-03-28T02:30'))
})
