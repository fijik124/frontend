import { computed } from 'vue'
import { router } from '../router'

export function navigate(href: string, replace = false) {
  const url = new URL(href, window.location.origin)
  if (url.origin !== window.location.origin) return
  const destination = url.pathname + url.search + url.hash
  return replace ? router.replace(destination) : router.push(destination)
}
export function useAppRouter() {
  return {
    path: computed(() => router.currentRoute.value.path),
    page: computed(() => router.currentRoute.value.meta.layout === 'dashboard' ? 'dashboard' : router.currentRoute.value.name),
    navigate,
  }
}
