<script setup lang="ts">
import { ref, watch } from 'vue'
import AppLink from './AppLink.vue'
import RaceIcon from './RaceIcon.vue'
import { navigate } from '../composables/useAppRouter'
import { useMembership, type MemberInput, type MemberRole } from '../stores/membership'
const props = defineProps<{ mode: 'login' | 'register' }>()
const { login, loginDemo, createMember, verifyLicense, storageError } = useMembership()
const email = ref('')
const error = ref('')
const consent = ref(false)
const firstName = ref('')
const lastName = ref('')
const licenseNumber = ref('')
const licenseVerified = ref(false)
const licenseError = ref('')
const form = ref<MemberInput>({ firstName: '', lastName: '', name: '', email: '', phone: '', group: 'Neurčené', status: 'pending', role: 'member', feePaid: false, number: '' })
watch(() => props.mode, () => { error.value = ''; consent.value = false })
watch([firstName, lastName, licenseNumber], () => { licenseVerified.value = false; licenseError.value = '' })
function checkLicense() {
  licenseError.value = ''
  licenseVerified.value = false
  try { verifyLicense(licenseNumber.value, firstName.value, lastName.value); licenseVerified.value = true }
  catch (cause) { licenseError.value = cause instanceof Error ? cause.message : 'Licenciu sa nepodarilo overiť.' }
}
function submit() {
  error.value = ''
  try {
    if (props.mode === 'register') {
      if (!consent.value) throw new Error('Potvrď, že rozumieš fungovaniu lokálnej ukážky.')
      createMember(form.value, { code: licenseNumber.value, firstName: firstName.value, lastName: lastName.value })
    } else login(email.value)
    navigate('/clenska-zona')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Akcia sa nepodarila. Skús to znova.' }
}
function enterDemo(role: MemberRole) {
  try { loginDemo(role); navigate('/clenska-zona') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Demo účet nie je dostupný.' }
}
</script>

<template>
  <main id="main-content" class="auth-layout min-h-svh bg-paper text-ink lg:grid lg:grid-cols-2">
    <aside class="auth-visual relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-16" aria-label="OŠK AMK Veľký Klíž"><img src="/images/motocross-hero.jpg" class="absolute inset-0 h-full w-full object-cover opacity-40" alt="Motokrosový jazdec vo vzduchu" /><AppLink href="/" class="relative z-10 flex items-center gap-4"><span class="brand-mark">AMK<span></span></span><span class="caption-3">OŠK AMK<br />Veľký Klíž</span></AppLink><div class="relative z-10 my-16"><p class="eyebrow text-[#fca692]">Tvoja partia. Tvoj klub.</p><h2 class="heading-1 mt-6">Všetci jazdíme<br />za jeden tím.</h2><p class="body-3 mt-6 max-w-sm text-white/80">Členská zóna pre ľudí, ktorí tvoria náš klub. Na trati aj za jej hranicami.</p></div><div class="relative z-10 flex items-center justify-between gap-4"><span class="caption-4 text-white/70">Jeden klub. Jedna vášeň.</span><span class="checkered-mark" aria-hidden="true"></span></div></aside>
    <div class="mx-auto flex w-full max-w-2xl flex-col px-6 py-8 md:px-16 lg:py-12"><AppLink href="/" class="button-sm mb-10 flex items-center gap-3 self-start text-ink/60 hover:text-race"><RaceIcon class="rotate-180" /> Späť na web</AppLink><div class="my-auto py-6"><p class="eyebrow text-race">Členská zóna / {{ mode === 'login' ? 'Prihlásenie' : 'Registrácia' }}</p><h1 class="heading-2 mt-4">{{ mode === 'login' ? 'Vitaj späť v depe.' : 'Pridaj sa do partie.' }}</h1><p class="body-6 mt-4 text-ink/60">{{ mode === 'login' ? 'Tvoje členstvo, klubové informácie a spoločný svet motokrosu.' : 'Registráciu dokončíš iba s licenciou vydanou správcom pre tvoje meno a priezvisko.' }}</p><div class="demo-notice mt-6"><span class="caption-3 block">Lokálna ukážka bez skutočného prihlasovania</span><p class="caption-5 mt-2">Heslá sa nepoužívajú. Údaje zostávajú v tomto prehliadači. Zadaj iba ukážkové údaje.</p></div>
      <p v-if="storageError" class="form-error mt-4" role="alert">{{ storageError }}</p>
      <form class="mt-8" @submit.prevent="submit">
        <template v-if="mode === 'register'">
          <div class="grid gap-4 sm:grid-cols-2"><label class="form-label" for="register-first-name">Meno<input id="register-first-name" v-model="firstName" class="form-input" autocomplete="given-name" required minlength="2" maxlength="60" placeholder="Meno z licencie" /></label><label class="form-label" for="register-last-name">Priezvisko<input id="register-last-name" v-model="lastName" class="form-input" autocomplete="family-name" required minlength="2" maxlength="60" placeholder="Priezvisko z licencie" /></label></div>
          <div class="my-6 rounded-sm border border-ink/15 bg-white p-4"><label class="form-label" for="register-license">Registračné licenčné číslo<input id="register-license" v-model="licenseNumber" class="form-input font-mono uppercase" autocomplete="off" autocapitalize="characters" :spellcheck="false" required maxlength="30" placeholder="AMK-2026-XXXXX-XXXXX" /></label><p id="license-help" class="caption-5 mt-3 text-ink/60">Kód ti vydá správca klubu. Meno aj priezvisko sa musia zhodovať s licenciou vrátane diakritiky. Každý kód možno použiť iba raz.</p><button type="button" class="button-sm mt-4 inline-flex items-center gap-3 text-race hover:underline" @click="checkLicense">Overiť licenciu <RaceIcon name="check" /></button><p v-if="licenseVerified" class="body-6 mt-3 text-emerald-800" role="status">Licencia je platná pre {{ firstName.trim() }} {{ lastName.trim() }}.</p><p v-if="licenseError" class="form-error mt-3" role="alert">{{ licenseError }}</p></div>
          <label class="form-label" for="register-email">Email<input id="register-email" v-model="form.email" class="form-input" type="email" autocomplete="email" required maxlength="180" placeholder="tvoj@email.sk" /></label>
          <p class="caption-5 mt-3 text-ink/60">Typ členstva, telefón a štartové číslo doplníš vo svojom profile po registrácii. Upraviť ich môže aj správca.</p>
        </template>
        <label v-else class="form-label" for="login-email">Email člena<input id="login-email" v-model="email" class="form-input" type="email" autocomplete="email" required placeholder="jazdec@amk-demo.example" /></label>
        <label v-if="mode === 'register'" class="body-6 mt-6 flex items-start gap-3 text-ink/65"><input v-model="consent" type="checkbox" required class="mt-1 h-4 w-4 shrink-0 accent-race" /><span>Rozumiem, že ide o demo. Údaje sa ukladajú iba do tohto prehliadača a nejde o skutočnú prihlášku do klubu.</span></label>
        <p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p>
        <button class="button-md mt-6 flex w-full items-center justify-between gap-4 rounded-sm bg-race px-3 py-3 text-white hover:bg-race-hover active:scale-[.98]" type="submit">{{ mode === 'login' ? 'Prihlásiť sa do dema' : 'Odoslať demo žiadosť' }}<RaceIcon /></button>
      </form>
      <template v-if="mode === 'login'"><div class="my-6 flex items-center gap-4"><span class="h-px flex-1 bg-ink/15"></span><span class="caption-4 text-ink/50">alebo vyskúšaj ukážkový účet</span><span class="h-px flex-1 bg-ink/15"></span></div><div class="grid gap-3 sm:grid-cols-2"><button class="demo-account" @click="enterDemo('admin')"><span class="title-3">Správca klubu <span aria-hidden="true">↗</span></span><span class="caption-5 mt-1 text-ink/60">Správa členov a žiadostí</span></button><button class="demo-account" @click="enterDemo('member')"><span class="title-3">Člen klubu <span aria-hidden="true">↗</span></span><span class="caption-5 mt-1 text-ink/60">Vlastný členský profil</span></button></div></template>
      <p class="body-6 mt-8 text-center text-ink/60"><template v-if="mode === 'login'">Máš licenciu od správcu? <AppLink href="/registracia" class="font-semibold text-race hover:underline">Dokončiť registráciu</AppLink></template><template v-else>Už máš demo účet? <AppLink href="/prihlasenie" class="font-semibold text-race hover:underline">Prihlásiť sa</AppLink></template></p>
    </div><p class="caption-5 mt-10 text-ink/50">OŠK AMK Veľký Klíž · Členské demo · Bez odosielania údajov na server</p></div>
  </main>
</template>

