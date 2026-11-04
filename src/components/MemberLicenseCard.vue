<script setup lang="ts">
import { licenseExpired, useMembership, type MemberLicense } from '../stores/membership'
const { roleName } = useMembership()
defineProps<{ license: MemberLicense | null }>()
function formatDate(date: string) { return new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bratislava' }).format(new Date(date + 'T12:00:00Z')) }
</script>
<template>
  <div v-if="license" class="mt-6 rounded-sm border border-current/15 p-4"><div class="flex flex-wrap items-center justify-between gap-3"><span class="caption-3">Členská licencia</span><span class="caption-3" :class="licenseExpired(license) || license.status === 'revoked' ? 'text-red-600' : 'text-emerald-600'">{{ license.status === 'revoked' ? 'Zrušená' : licenseExpired(license) ? 'Platnosť vypršala' : 'Platná' }}</span></div><p class="body-6 mt-4 break-all font-mono font-semibold">{{ license.code }}</p><p class="caption-4 mt-3">{{ license.validUntil ? 'Platná do ' + formatDate(license.validUntil) + ' vrátane' : 'Platnosť bez časového obmedzenia' }}</p><p class="caption-5 mt-2 opacity-60">Viazaná na {{ license.firstName }} {{ license.lastName }} · {{ roleName(license.role) }}</p></div>
</template>

