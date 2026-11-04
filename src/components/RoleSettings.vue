<script setup lang="ts">
import { ref } from 'vue'
import RaceIcon from './RaceIcon.vue'
import { useMembership, permissionOptions, type ClubRole, type Permission } from '../stores/membership'
const { roles, members, licenses, saveRole, deleteRole } = useMembership()
const editor = ref<HTMLDialogElement | null>(null)
const confirmation = ref<HTMLDialogElement | null>(null)
const editingId = ref<string | undefined>()
const name = ref('')
const description = ref('')
const permissions = ref<Permission[]>([])
const error = ref('')
const success = ref('')
const target = ref<ClubRole | null>(null)
function edit(role?: ClubRole) {
  editingId.value = role?.id
  name.value = role?.name ?? ''
  description.value = role?.description ?? ''
  permissions.value = [...(role?.permissions ?? [])]
  error.value = ''
  editor.value?.showModal()
}
function save() {
  error.value = ''
  try {
    saveRole({ id: editingId.value, name: name.value, description: description.value, permissions: permissions.value })
    editor.value?.close()
    success.value = 'Rola ' + name.value.trim() + ' bola uložená. Je dostupná pri členoch aj licenciách.'
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Rolu sa nepodarilo uložiť.' }
}
function askDelete(role: ClubRole) { target.value = role; error.value = ''; confirmation.value?.showModal() }
function remove() {
  error.value = ''
  try { if (target.value) deleteRole(target.value.id); confirmation.value?.close(); success.value = 'Rola bola odstránená.' }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Rolu sa nepodarilo odstrániť.' }
}
function memberCount(id: string) { return members.value.filter(member => member.role === id).length }
function invitationCount(id: string) { return licenses.value.filter(license => license.role === id && license.status === 'available').length }
</script>

<template>
  <div>
    <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p class="eyebrow text-race">Každý má v tíme svoje miesto</p><h1 class="heading-3 mt-3">Roly a oprávnenia.</h1><p class="body-6 mt-3 max-w-2xl text-ink/55">Vytvor vlastné roly a nastav, čo môže používateľ spravovať. Rolu potom priradíš členovi alebo novej licencii.</p></div><button class="dashboard-primary self-start" @click="edit()"><RaceIcon name="plus" /> Pridať rolu</button></div>
    <p v-if="success" class="dashboard-toast mt-6" role="status"><RaceIcon name="check" /> {{ success }}</p>
    <div class="demo-notice body-6 mt-6">Typ členstva je súčasťou roly. Člen môže upravovať svoj telefón a štartové číslo; rolu a oprávnenia nastavuje poverený správca. Oprávnenia nižšie riadia prístup k správe klubu v lokálnom deme.</div>
    <section class="mt-8 grid gap-4 xl:grid-cols-2" aria-label="Existujúce členské roly">
      <article v-for="role in roles" :key="role.id" class="dashboard-card flex flex-col p-6"><div class="flex items-start justify-between gap-4"><div><h2 class="heading-5 break-words">{{ role.name }}</h2><p class="body-6 mt-3 text-ink/55">{{ role.description || 'Vlastná rola združenia.' }}</p></div><span v-if="role.protected" class="caption-5 shrink-0 rounded-sm bg-ink/5 px-2 py-1 text-ink/55">Základná rola</span></div><div class="caption-4 mt-6 flex flex-wrap gap-4 text-ink/55"><span>{{ memberCount(role.id) }} členov</span><span>{{ invitationCount(role.id) }} nepriradených licencií</span></div><ul class="mt-6 grid gap-3"><li v-for="permission in permissionOptions" :key="permission.id" class="body-6 flex items-center gap-3" :class="role.permissions.includes(permission.id) ? 'text-ink' : 'text-ink/35'"><RaceIcon v-if="role.permissions.includes(permission.id)" name="check" class="text-emerald-700" /><span v-else class="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">—</span>{{ permission.name }}<span class="sr-only">{{ role.permissions.includes(permission.id) ? ': povolené' : ': nepovolené' }}</span></li></ul><div class="mt-8 flex flex-wrap gap-3"><button class="dashboard-secondary" :disabled="role.id === 'admin'" @click="edit(role)"><RaceIcon name="edit" /> {{ role.id === 'admin' ? 'Úplný prístup je pevne nastavený' : 'Upraviť oprávnenia' }}</button><button v-if="!role.protected" class="button-sm px-2 text-race hover:underline" @click="askDelete(role)">Odstrániť</button></div></article>
    </section>
    <dialog ref="editor" class="member-dialog" aria-labelledby="role-title" @keydown.esc.prevent="editor?.close()"><form @submit.prevent="save"><div class="flex items-start justify-between gap-6"><div><p class="eyebrow text-race">Prístup do klubovej zóny</p><h2 id="role-title" class="heading-5 mt-3">{{ editingId ? 'Upraviť rolu' : 'Nová členská rola' }}</h2></div><button class="table-icon-button" type="button" aria-label="Zavrieť formulár roly" @click="editor?.close()">×</button></div><label class="form-label mt-6" for="role-name">Názov roly<input id="role-name" v-model="name" class="form-input" required minlength="2" maxlength="60" placeholder="Napríklad Organizátor pretekov" /></label><label class="form-label mt-4" for="role-description">Popis<textarea id="role-description" v-model="description" class="form-input" maxlength="500" placeholder="Čo má táto rola v klube na starosti"></textarea></label><fieldset class="mt-6"><legend class="title-3">Čo môže táto rola robiť?</legend><p class="caption-5 mt-2 text-ink/55">Bez ďalších oprávnení má používateľ prístup iba k vlastnému profilu a licencii.</p><div class="mt-4 grid gap-3"><label v-for="permission in permissionOptions" :key="permission.id" class="flex cursor-pointer items-start gap-3 rounded-sm border border-ink/15 bg-white p-4"><input v-model="permissions" :value="permission.id" type="checkbox" class="mt-1 h-4 w-4 shrink-0 accent-race" /><span><span class="body-6 block font-semibold">{{ permission.name }}</span><span class="caption-5 mt-1 block text-ink/55">{{ permission.description }}</span></span></label></div></fieldset><p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><div class="mt-8 flex justify-end gap-3"><button class="dashboard-secondary" type="button" @click="editor?.close()">Zrušiť</button><button class="dashboard-primary" type="submit">Uložiť rolu <RaceIcon name="check" /></button></div></form></dialog>
    <dialog ref="confirmation" class="member-dialog max-w-lg" aria-labelledby="delete-role-title" @keydown.esc.prevent="confirmation?.close()"><h2 id="delete-role-title" class="heading-5">Odstrániť rolu {{ target?.name }}?</h2><p class="body-6 mt-4 text-ink/60">Rolu možno odstrániť iba vtedy, ak nie je priradená žiadnemu členovi ani nepriradenej licencii.</p><p v-if="error" class="form-error mt-4" role="alert">{{ error }}</p><div class="mt-8 flex justify-end gap-3"><button class="dashboard-secondary" autofocus @click="confirmation?.close()">Zrušiť</button><button class="dashboard-primary" @click="remove">Odstrániť rolu</button></div></dialog>
  </div>
</template>
