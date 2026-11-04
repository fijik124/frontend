<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ href: string }>()
const route = useRoute()
const router = useRouter()
const target = computed(() => router.resolve(props.href))
const active = computed(() => route.path === target.value.path && route.hash === target.value.hash)
</script>
<template>
  <RouterLink :to="href" custom v-slot="{ href: linkHref, navigate }">
    <a v-bind="$attrs" :href="linkHref" @click="navigate"
      :class="{ 'router-link-active': active, 'router-link-exact-active': active }"
      :aria-current="active ? (target.hash ? 'location' : 'page') : undefined"><slot /></a>
  </RouterLink>
</template>
