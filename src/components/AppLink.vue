<script setup lang="ts">
import { RouterLink } from 'vue-router'
defineProps<{ href: string }>()
</script>
<template><RouterLink :to="href"><slot /></RouterLink></template>
