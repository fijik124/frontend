<script setup lang="ts">
defineProps<{
    cifra: number
}>()
import ComponentB from './ComponentB.vue'
</script>

<template>
    <p>Komponent A: {{ cifra }}</p>
    <ComponentB :cifrab="cifra.toString()" />
</template>