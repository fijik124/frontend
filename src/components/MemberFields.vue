<script setup lang="ts">
import { useId } from 'vue'
import { useMembership, type MemberInput } from '../stores/membership'
const { roles, roleName, hasPermission } = useMembership()
const model = defineModel<MemberInput>({ required: true })
withDefaults(defineProps<{ admin?: boolean; hideName?: boolean; lockName?: boolean; lockEmail?: boolean }>(), { admin: false, hideName: false, lockName: false })
const id = useId()
</script>
<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <template v-if="!hideName"><label class="form-label" :for="id + '-first-name'">Meno<input :id="id + '-first-name'" v-model="model.firstName" class="form-input" autocomplete="given-name" :readonly="lockName" required minlength="2" maxlength="60" placeholder="Meno" /></label><label class="form-label" :for="id + '-last-name'">Priezvisko<input :id="id + '-last-name'" v-model="model.lastName" class="form-input" autocomplete="family-name" :readonly="lockName" required minlength="2" maxlength="60" placeholder="Priezvisko" /></label><span v-if="lockName" class="caption-5 font-normal text-ink/55 sm:col-span-2">Meno je viazané na licenciu. Zmenu rieši správca klubu.</span></template>
    <label class="form-label" :for="id + '-email'">Email <input :id="id + '-email'" v-model="model.email" :readonly="!admin || lockEmail" class="form-input" type="email" autocomplete="email" required maxlength="180" placeholder="tvoj@email.sk" /></label>
    <label class="form-label" :for="id + '-phone'">Telefón <span class="font-normal text-ink/50">(nepovinné)</span><input :id="id + '-phone'" v-model="model.phone" class="form-input" type="tel" autocomplete="tel" maxlength="30" placeholder="+421" /></label>
    <label class="form-label" :for="id + '-role'">Rola v klube<select v-if="admin" :id="id + '-role'" v-model="model.role" class="form-input" :disabled="!hasPermission('roles.assign')"><option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option></select><input v-else :id="id + '-role'" class="form-input" :value="roleName(model.role)" readonly /><span v-if="!admin || !hasPermission('roles.assign')" class="caption-5 mt-2 block font-normal text-ink/55">Rolu a jej oprávnenia nastavuje poverený správca.</span></label>
    <label class="form-label" :for="id + '-number'">Štartové číslo <span class="font-normal text-ink/50">(nepovinné)</span><input :id="id + '-number'" v-model="model.number" class="form-input" maxlength="8" placeholder="127" /></label>
    <template v-if="admin"><label class="form-label" :for="id + '-status'">Stav členstva<select :id="id + '-status'" v-model="model.status" class="form-input"><option value="active">Aktívny</option><option value="pending">Čaká na schválenie</option><option value="inactive">Neaktívny</option></select></label><label class="body-6 flex items-center gap-3 sm:col-span-2"><input v-model="model.feePaid" type="checkbox" class="h-4 w-4 accent-race" /> Členský príspevok je označený ako uhradený</label></template>
  </div>
</template>
