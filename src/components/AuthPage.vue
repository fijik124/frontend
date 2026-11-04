<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from './AppLink.vue'
import RaceIcon from './RaceIcon.vue'
import { navigate } from '../composables/useAppRouter'
import { useMembership } from '../stores/membership'
import { api, json } from '../api'
const props = defineProps<{ mode: 'login' | 'register' }>()
const route = useRoute()
const { login, register, verifyLicense, storageError } = useMembership()
const email = ref(''), password = ref(''), firstName = ref(''), lastName = ref(''), licenseNumber = ref('')
const form = ref({ email: '' }), error = ref(''), success = ref(''), busy = ref(false), checking = ref(false)
const licenseVerified = ref(false), licenseError = ref('')
watch(() => props.mode, () => { error.value = ''; success.value = ''; password.value = '' })
watch([firstName, lastName, licenseNumber], () => { licenseVerified.value = false; licenseError.value = '' })
async function checkLicense() {
  if (checking.value) return
  checking.value = true; licenseError.value = ''; licenseVerified.value = false
  const values = [firstName.value, lastName.value, licenseNumber.value]
  try { await verifyLicense(licenseNumber.value, firstName.value, lastName.value); licenseVerified.value = values.every((v, i) => v === [firstName.value, lastName.value, licenseNumber.value][i]) }
  catch (cause) { licenseError.value = cause instanceof Error ? cause.message : 'Licenciu sa nepodarilo overiť.' }
  finally { checking.value = false }
}
async function submit() {
  if (busy.value) return
  busy.value = true; error.value = ''; success.value = ''
  try {
    if (props.mode === 'register') {
      const result = await register({ firstName: firstName.value, lastName: lastName.value, email: form.value.email, password: password.value, code: licenseNumber.value })
      success.value = result.message; password.value = ''
    } else {
      await login(email.value, password.value); password.value = ''
      const redirect = route.query.redirect
      await navigate(typeof redirect === 'string' && /^\/clenska-zona(?:\/|$)/.test(redirect) ? redirect : '/clenska-zona')
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Požiadavku sa nepodarilo spracovať.' }
  finally { busy.value = false }
}
async function resendVerification() {
  if (busy.value || !email.value) return
  busy.value = true; error.value = ''; success.value = ''
  try { await api('/auth/send-verification-email', json('POST', { email: email.value, callbackURL: location.origin + '/prihlasenie?verified=1' })); success.value = 'Ak účet potrebuje overenie, odoslali sme email s odkazom.' }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Email sa nepodarilo odoslať.' }
  finally { busy.value = false }
}
</script>
<template>
  <main
    id="main-content"
    class="auth-layout min-h-svh bg-paper text-ink lg:grid lg:grid-cols-2"
  >
    <aside
      class="auth-visual relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-16"
      aria-label="OŠK AMK Veľký Klíž"
    >
      <img
        src="/images/motocross-hero.jpg"
        class="absolute inset-0 h-full w-full object-cover opacity-40"
        alt="Motokrosový jazdec vo vzduchu"
      /><AppLink href="/" class="relative z-10 flex items-center gap-4"
        ><span class="brand-mark">AMK<span></span></span
        ><span class="caption-3">OŠK AMK<br />Veľký Klíž</span></AppLink
      >
      <div class="relative z-10 my-16">
        <p class="eyebrow text-[#fca692]">Tvoja partia. Tvoj klub.</p>
        <h2 class="heading-1 mt-6">Všetci jazdíme<br />za jeden tím.</h2>
        <p class="body-3 mt-6 max-w-sm text-white/80">
          Členská zóna pre ľudí, ktorí tvoria náš klub. Na trati aj za jej
          hranicami.
        </p>
      </div>
      <div class="relative z-10 flex items-center justify-between gap-4">
        <span class="caption-4 text-white/70">Jeden klub. Jedna vášeň.</span
        ><span class="checkered-mark" aria-hidden="true"></span>
      </div>
    </aside>
    <div
      class="mx-auto flex w-full max-w-2xl flex-col px-6 py-8 md:px-16 lg:py-12"
    >
      <AppLink
        href="/"
        class="button-sm mb-10 flex items-center gap-3 self-start text-ink/60 hover:text-race"
        ><RaceIcon class="rotate-180" /> Späť na web</AppLink
      >
      <div class="my-auto py-6">
        <p class="eyebrow text-race">
          Členská zóna / {{ mode === "login" ? "Prihlásenie" : "Registrácia" }}
        </p>
        <h1 class="heading-2 mt-4">
          {{ mode === "login" ? "Vitaj späť v depe." : "Pridaj sa do partie." }}
        </h1>
        <p class="body-6 mt-4 text-ink/60">
          {{
            mode === "login"
              ? "Tvoje členstvo, klubové informácie a spoločný svet motokrosu."
              : "Registráciu dokončíš iba s licenciou vydanou správcom pre tvoje meno a priezvisko."
          }}
        </p>
<p v-if="route.query.verified" class="demo-notice mt-6" role="status">Email je overený. Môžete sa prihlásiť.</p>
        <p v-if="storageError" class="form-error mt-4" role="alert">
          {{ storageError }}
        </p>
<form class="mt-8" @submit.prevent="submit" :aria-busy="busy">
          <fieldset :disabled="busy || !!success && mode === 'register'">
          <template v-if="mode === 'register'">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="form-label" for="register-first-name"
                >Meno<input
                  id="register-first-name"
                  v-model="firstName"
                  class="form-input"
                  autocomplete="given-name"
                  required
                  minlength="2"
                  maxlength="60"
                  placeholder="Meno z licencie" /></label
              ><label class="form-label" for="register-last-name"
                >Priezvisko<input
                  id="register-last-name"
                  v-model="lastName"
                  class="form-input"
                  autocomplete="family-name"
                  required
                  minlength="2"
                  maxlength="60"
                  placeholder="Priezvisko z licencie"
              /></label>
            </div>
            <div class="my-6 rounded-sm border border-ink/15 bg-white p-4">
              <label class="form-label" for="register-license"
                >Registračné licenčné číslo<input
                  id="register-license"
                  v-model="licenseNumber"
                  class="form-input font-mono uppercase"
                  autocomplete="off"
                  autocapitalize="characters"
                  :spellcheck="false"
                  required
                  maxlength="30"
                  placeholder="AMK-2026-XXXXX-XXXXX"
              /></label>
              <p id="license-help" class="caption-5 mt-3 text-ink/60">
                Kód ti vydá správca klubu. Meno aj priezvisko sa musia zhodovať
                s licenciou vrátane diakritiky. Každý kód možno použiť iba raz.
              </p>
              <button
                type="button"
                class="button-sm mt-4 inline-flex items-center gap-3 text-race hover:underline"
                :disabled="checking || busy" @click="checkLicense"
              >
                Overiť licenciu <RaceIcon name="check" />
              </button>
              <p
                v-if="licenseVerified"
                class="body-6 mt-3 text-emerald-800"
                role="status"
              >
                Licencia je platná pre {{ firstName.trim() }}
                {{ lastName.trim() }}.
              </p>
              <p v-if="licenseError" class="form-error mt-3" role="alert">
                {{ licenseError }}
              </p>
            </div>
            <label class="form-label" for="register-email"
              >Email<input
                id="register-email"
                v-model="form.email"
                class="form-input"
                type="email"
                autocomplete="email"
                required
                maxlength="180"
                placeholder="tvoj@email.sk"
            /></label>
            <p class="caption-5 mt-3 text-ink/60">
              Telefón a štartové číslo doplníš po registrácii. Rolu v klube a
              jej oprávnenia určuje správca a sú viazané na licenciu.
            </p>
          </template>
          <label v-else class="form-label" for="login-email"
            >Email člena<input
              id="login-email"
              v-model="email"
              class="form-input"
              type="email"
              autocomplete="email"
              required
              placeholder="tvoj@email.sk"
          /></label>

<label class="form-label mt-6" for="auth-password">Heslo<input id="auth-password" v-model="password" class="form-input" type="password" :autocomplete="mode === 'register' ? 'new-password' : 'current-password'" :minlength="mode === 'register' ? 12 : undefined" maxlength="128" required /></label>
          <p v-if="mode === 'register'" class="caption-5 mt-3 text-ink/60">Použite aspoň 12 znakov.</p>
          <p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p>
          <button
            class="button-md mt-6 flex w-full items-center justify-between gap-4 rounded-sm bg-race px-3 py-3 text-white hover:bg-race-hover active:scale-[.98]"
            type="submit"
          >
            {{
              busy ? "Spracúvame…" : mode === "login"
                ? "Prihlásiť sa"
                : "Odoslať žiadosť"
            }}<RaceIcon />
          </button>
          </fieldset>
        </form>
        <p v-if="success" class="demo-notice mt-6" role="status">{{ success }}</p>
        <div v-if="mode === 'login'" class="body-6 mt-6 flex flex-wrap gap-4"><AppLink href="/obnova-hesla" class="text-race hover:underline">Zabudnuté heslo</AppLink><button type="button" class="text-race hover:underline" :disabled="busy || !email" @click="resendVerification">Odoslať overovací email</button></div>

        <p class="body-6 mt-8 text-center text-ink/60">
          <template v-if="mode === 'login'"
            >Máš licenciu od správcu?
            <AppLink
              href="/registracia"
              class="font-semibold text-race hover:underline"
              >Dokončiť registráciu</AppLink
            ></template
          ><template v-else
            >Už máš účet?
            <AppLink
              href="/prihlasenie"
              class="font-semibold text-race hover:underline"
              >Prihlásiť sa</AppLink
            ></template
          >
        </p>
      </div>
      <p class="caption-5 mt-10 text-ink/50">
        OŠK AMK Veľký Klíž · Členská zóna
      </p>
    </div>
  </main>
</template>
