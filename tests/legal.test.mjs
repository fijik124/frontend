import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createServer } from 'vite'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { getLegalMissingFields, legalConfig, legalProviderLinks, legalValue } from '../src/config/legal.ts'

test('publication needs a complete configuration and explicit approval', () => {
  const config = structuredClone(legalConfig)
  for (const group of ['operator', 'services', 'retention']) {
    for (const key of Object.keys(config[group])) config[group][key] = 'Overené'
  }
  config.operator.registrationNumber = '57517193'
  config.effectiveDate = config.reviewedAt = '2026-11-20'
  config.publicationApproved = false
  assert.deepEqual(getLegalMissingFields(config), ['publicationApproved'])
  config.publicationApproved = true
  assert.deepEqual(getLegalMissingFields(config), [])
  config.operator.registrationNumber = 'VVS/1-900/90-73916'
  assert.deepEqual(getLegalMissingFields(config), ['operator.registrationNumber'])
  config.operator.registrationNumber = ''
  assert.deepEqual(getLegalMissingFields(config), ['operator.registrationNumber'])
  config.operator.registrationNumber = '57517193'
  config.services.transfersOutsideEea = '  '
  assert.deepEqual(getLegalMissingFields(config), ['services.transfersOutsideEea'])
  config.services.transfersOutsideEea = 'Overené'
  config.retention.membership = ''
  config.reviewedAt = ''
  assert.deepEqual(getLegalMissingFields(config), ['retention.membership', 'reviewedAt'])
  assert.equal(legalValue('  '), 'Doplniť pred zverejnením')
})

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' })
after(() => server.close())
const { default: LegalPage } = await server.ssrLoadModule('/src/components/LegalPage.vue')
const { legalNavigation } = await server.ssrLoadModule('/src/data/legal.ts')

test('all legal pages render the approval state and separate IČO from registration', async () => {
  const { legalReady } = await server.ssrLoadModule('/src/config/legal.ts')
  for (const { id, href } of legalNavigation) {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => null } }, ...legalNavigation.map(item => ({ path: item.href, component: LegalPage }))] })
    await router.push(href)
    const html = await renderToString(createSSRApp(LegalPage, { document: id }).use(router))
    assert.doesNotMatch(html, /lokáln[ay]|lokálnom|vývojov[áé]|fiktívn|localStorage|sessionStorage|amk:local-/i)
    assert.equal(html.includes('aria-label="Stav dokumentu"'), !legalReady)
    assert.equal(html.includes('Účinnosť:'), legalReady)
    if (id !== 'cookies') {
      assert.match(html, /IČO<\/dt><dd[^>]*>57517193<\/dd>/)
      assert.match(html, /Číslo zápisu<\/dt><dd[^>]*>VVS\/1-900\/90-73916<\/dd>/)
      assert.ok(html.includes('Maloletým účty nezriaďujeme'))
      assert.ok(html.includes(`href="${legalConfig.operator.registerUrl}"`))
      if (id === 'privacy') {
        for (const { href } of legalProviderLinks) assert.ok(html.includes(`href="${href}"`))
      }
    } else {
      assert.ok(html.includes('__Secure-better-auth.session_token'))
      assert.ok(html.includes('Platnosť 7 dní'))
      assert.ok(html.includes('__Secure-better-auth.dont_remember'))
      assert.ok(html.includes('Secure, HttpOnly, SameSite=Lax'))
      assert.ok(html.includes('najskôr po 24 hodinách'))
      assert.ok(!html.includes('Absolútne nevyhnutné, funkčné a analytické'))
    }
  }
})

test('privacy page links official provider sources without claiming verified contracts or EU-only Gmail', async () => {
  const { legalDocuments } = await server.ssrLoadModule('/src/data/legal.ts')
  const recipients = legalDocuments.privacy.sections.find(section => section.id === 'prijemcovia')
  assert.equal(recipients.links.length, legalProviderLinks.length)
  for (const { href } of recipients.links) {
    const url = new URL(href)
    assert.equal(url.protocol, 'https:')
    assert.ok(['www.hetzner.com', 'docs.hetzner.com', 'policies.google.com'].includes(url.hostname))
  }
  assert.ok(legalConfig.services.providerContracts.includes('Bežný Gmail'))
  assert.ok(legalConfig.services.providerContracts.includes('musí prevádzkovateľ doložiť'))
  assert.ok(legalConfig.services.transfersOutsideEea.includes('mimo EHP'))
  assert.ok(legalConfig.retention.correspondence.includes('10 rokov nasledujúcich po roku'))
})
