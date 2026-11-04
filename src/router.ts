import { createRouter, createWebHistory } from 'vue-router'
import { useMembership } from './stores/membership'

const dashboard = () => import('./components/MemberDashboard.vue')
const dashboardRoutes = [
  { path: '/clenska-zona', name: 'dashboard', tab: 'overview', title: 'Členská zóna' },
  { path: '/clenska-zona/clenovia', name: 'dashboard-members', tab: 'members', title: 'Členovia', permissions: ['members.read', 'members.write'] },
  { path: '/clenska-zona/licencie', name: 'dashboard-licenses', tab: 'licenses', title: 'Členské licencie', permissions: ['licenses.manage'] },
  { path: '/clenska-zona/ziadosti', name: 'dashboard-requests', tab: 'requests', title: 'Žiadosti', permissions: ['members.write'] },
  { path: '/clenska-zona/roly', name: 'dashboard-roles', tab: 'roles', title: 'Roly a oprávnenia', permissions: ['roles.manage'] },
  { path: '/clenska-zona/preteky', name: 'dashboard-race', tab: 'race', title: 'Nastavenia pretekov', permissions: ['race.manage'] },
  { path: '/clenska-zona/moj-profil', name: 'dashboard-profile', tab: 'profile', title: 'Môj profil' },
  { path: '/clenska-zona/nastavenia', name: 'dashboard-settings', tab: 'settings', title: 'Nastavenia účtu', permissions: ['roles.manage'] },
]
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./components/HomePage.vue'), meta: { layout: 'site', title: 'Motokros je náš svet' } },
    { path: '/preteky', name: 'race', component: () => import('./components/RacePage.vue'), meta: { layout: 'site', title: 'Informácie o pretekoch' } },
    { path: '/prihlasenie', name: 'login', component: () => import('./components/AuthPage.vue'), props: { mode: 'login' }, meta: { layout: 'auth', title: 'Prihlásenie členov', noindex: true } },
    { path: '/registracia', name: 'register', component: () => import('./components/AuthPage.vue'), props: { mode: 'register' }, meta: { layout: 'auth', title: 'Registrácia s licenciou', noindex: true } },
    { path: '/obnova-hesla', name: 'password-reset', component: () => import('./components/PasswordResetPage.vue'), meta: { layout: 'auth', title: 'Obnovenie hesla', noindex: true } },
    ...dashboardRoutes.map(route => ({ path: route.path, name: route.name, component: dashboard, meta: { layout: 'dashboard', title: route.title, requiresSession: true, noindex: true, dashboardTab: route.tab, permissions: route.permissions } })),
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./components/NotFoundPage.vue'), meta: { layout: 'site', title: 'Stránka sa nenašla', noindex: true } },
  ],
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 32, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }
    if (to.meta.layout === 'dashboard' && from.meta.layout === 'dashboard') return { top: 0, behavior: 'instant' }
    return { top: 0, behavior: 'instant' }
  },
})
router.beforeEach(async to => {
  const { currentMember, hasPermission, initialize } = useMembership()
  await initialize()
  if (to.meta.requiresSession && (!currentMember.value || currentMember.value.status === 'inactive')) return { name: 'login', query: { redirect: to.fullPath } }
  const permissions = to.meta.permissions as string[] | undefined
  if (permissions?.length && !permissions.some(permission => hasPermission(permission))) return { name: 'dashboard' }
})
router.afterEach(to => {
  document.title = `${String(to.meta.title ?? 'Motokros')} | OŠK AMK Veľký Klíž`
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (to.meta.noindex) {
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots) }
    robots.content = 'noindex, nofollow'
  } else robots?.remove()
})
