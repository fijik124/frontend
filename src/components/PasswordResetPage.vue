<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from './AppLink.vue'
import { api, json } from '../api'
const route = useRoute()
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const email = ref(''), password = ref(''), confirmation = ref(''), busy = ref(false), error = ref(''), success = ref('')
async function submit() {
  if (busy.value) return
  error.value = ''; success.value = ''; busy.value = true
  try {
    if (token.value) {
      if (password.value !== confirmation.value) throw new Error('Heslá sa nezhodujú.')
      await api('/auth/reset-password', json('POST', { token: token.value, newPassword: password.value }))
      password.value = ''; confirmation.value = ''; success.value = 'Heslo bolo zmenené. Môžete sa prihlásiť.'
    } else {
      await api('/auth/request-password-reset', json('POST', { email: email.value, redirectTo: location.origin + '/obnova-hesla' }))
      success.value = 'Ak účet existuje, odoslali sme email s odkazom na obnovenie hesla.'
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Heslo sa nepodarilo obnoviť.' }
  finally { busy.value = false }
}
</script>
<template>
  <main id="main-content" class="min-h-svh bg-paper px-6 py-16 text-ink">
    <div class="mx-auto max-w-lg">
      <AppLink href="/prihlasenie" class="button-sm text-race hover:underline">Späť na prihlásenie</AppLink>
      <p class="eyebrow mt-10 text-race">OŠK AMK Veľký Klíž</p>
      <h1 class="heading-3 mt-4">Obnovenie hesla</h1>
      <p v-if="route.query.error" class="form-error mt-6" role="alert">Odkaz už nie je platný. Požiadajte o nový email.</p>
      <form class="mt-8" :aria-busy="busy" @submit.prevent="submit">
        <fieldset :disabled="busy || !!success && !!token">
          <template v-if="token">
            <label class="form-label" for="reset-password">Nové heslo<input id="reset-password" v-model="password" type="password" class="form-input" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
            <label class="form-label mt-4" for="reset-confirmation">Zopakujte heslo<input id="reset-confirmation" v-model="confirmation" type="password" class="form-input" autocomplete="new-password" minlength="12" maxlength="128" required /></label>
          </template>
          <label v-else class="form-label" for="reset-email">Email člena<input id="reset-email" v-model="email" type="email" class="form-input" autocomplete="email" required maxlength="180" /></label>
          <p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p>
          <p class="body-6 mt-6 text-ink/70">Údaje použijeme na overenie účtu a obnovenie prístupu. Viac v <AppLink href="/ochrana-osobnych-udajov" class="text-race underline underline-offset-4">ochrane osobných údajov</AppLink>.</p>
          <button class="dashboard-primary mt-6" type="submit">{{ busy ? 'Spracúvame…' : token ? 'Uložiť nové heslo' : 'Odoslať odkaz' }}</button>
        </fieldset>
      </form>
      <p v-if="success" class="demo-notice mt-6" role="status">{{ success }}</p>
    </div>
  </main>
</template>
