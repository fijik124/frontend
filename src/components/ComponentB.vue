<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  cifrab: string
}>()

const temp = computed(() => {
  let pocet = 0

  for (let i = 0; i < props.cifrab.length; i++) {
    if (/\d/.test(props.cifrab.charAt(i))) {
      pocet++
    }
  }

  return pocet
})
</script>

<template>
  <p>Komponent B: Cifry: {{ temp }}</p>
</template>