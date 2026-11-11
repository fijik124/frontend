<script setup lang="ts">
import AppLink from './AppLink.vue'
import { legalNavigation } from '../data/legal'
</script>

<template>
  <nav aria-label="Právne informácie" class="caption-4 flex flex-wrap gap-x-6 gap-y-4">
    <AppLink v-for="item in legalNavigation" :key="item.id" :href="item.href" class="underline decoration-current/40 underline-offset-4 hover:text-race active:scale-[.98]">{{ item.label }}</AppLink>
  </nav>
</template>
