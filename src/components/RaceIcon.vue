<script setup lang="ts">
withDefaults(defineProps<{ name?: 'arrow' | 'external' | 'pin' | 'expand' | 'helmet' | 'flag' | 'people' | 'grid' | 'mail' | 'settings' | 'logout' | 'plus' | 'check' | 'download' | 'search' | 'edit' }>(), { name: 'arrow' })
</script>
<template>
  <svg class="race-icon shrink-0" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-if="name === 'arrow'" d="M40 128h176m-72-72 72 72-72 72" />
    <path v-else-if="name === 'external'" d="M64 192 192 64M72 64h120v120" />
    <template v-else-if="name === 'pin'"><path d="M208 104c0 64-80 120-80 120S48 168 48 104a80 80 0 0 1 160 0Z" /><circle cx="128" cy="104" r="24" /></template>
    <path v-else-if="name === 'expand'" d="M160 48h48v48m-48 0 48-48M96 208H48v-48m48 0-48 48" />
    <path v-else-if="name === 'helmet'" d="M40 144a88 88 0 0 1 176 0v40a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16Zm0 0h88l32 40h56M128 56v32m32 56h56M56 200v16h144v-16" />
    <path v-else-if="name === 'flag'" d="M48 224V48c48-48 112 48 160 0v112c-48 48-112-48-160 0m48-128v112m64-96v112M48 104c48-48 112 48 160 0" />
    <template v-else-if="name === 'grid'"><rect x="40" y="40" width="64" height="64" rx="8" /><rect x="152" y="40" width="64" height="64" rx="8" /><rect x="40" y="152" width="64" height="64" rx="8" /><rect x="152" y="152" width="64" height="64" rx="8" /></template>
    <template v-else-if="name === 'mail'"><rect x="32" y="56" width="192" height="144" rx="8" /><path d="m32 64 96 72 96-72" /></template>
    <template v-else-if="name === 'settings'"><path d="m104 32-8 24-24 12-24-4-24 40 16 20v24l-16 20 24 40 24-4 24 12 8 24h48l8-24 24-12 24 4 24-40-16-20v-24l16-20-24-40-24 4-24-12-8-24Z" /><circle cx="128" cy="136" r="32" /></template>
    <path v-else-if="name === 'logout'" d="M96 40H48v176h48m64-136 48 48-48 48m-64-48h112" />
    <path v-else-if="name === 'plus'" d="M128 48v160M48 128h160" />
    <path v-else-if="name === 'check'" d="m40 136 56 56L216 72" />
    <path v-else-if="name === 'download'" d="M128 32v128m-48-48 48 48 48-48M40 168v48h176v-48" />
    <template v-else-if="name === 'search'"><circle cx="112" cy="112" r="72" /><path d="m164 164 60 60" /></template>
    <path v-else-if="name === 'edit'" d="m168 40 48 48L88 216H40v-48L168 40Zm-16 16 48 48M40 168l48 48" />
    <template v-else><circle cx="96" cy="96" r="40" /><path d="M24 208a72 72 0 0 1 144 0m-8-152a40 40 0 0 1 0 80m24 20a64 64 0 0 1 48 52" /></template>
  </svg>
</template>

