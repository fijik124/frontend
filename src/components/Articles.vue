<script setup lang="ts">
defineProps<{
    title: string
    text: string
}>()
const emit = defineEmits(['enlarge-text'])

</script>

<template>
    <h1>{{title}}</h1>
    <p>{{text}}</p>
    <button @click="$emit('enlarge-text')">
        Enlarge text</button>
</template>

<style scoped>
</style>
