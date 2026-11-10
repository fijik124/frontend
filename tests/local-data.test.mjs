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
    assert.equal((await api('/me')).permissions.length, 6)
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

  await t.test('unknown requests fail locally; logout clears the session', async () => {
    await assert.rejects(api('/unimplemented'), error => error.status === 404)
    await api('/auth/sign-out', json('POST', {}))
    assert.equal(sessionStorage.getItem('amk:local-session:v1'), null)
    await assert.rejects(api('/me'), error => error.status === 401)
    assert.equal(networkCalls, 0)
  })
})
