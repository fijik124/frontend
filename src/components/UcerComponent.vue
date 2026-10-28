<script setup lang="ts">
defineProps<{
    url: string
    width: string
    height: string
}>()
</script>

<template>
    <div :width="width" :height="height" class="rounded-full flex items-center justify-center">
        <picture>
            <source :srcset="url" type="image/webp" />
            <img class="rounded-full" :src="url" :width="width" :height="height" alt="Active Users" />
        </picture>
    </div>
</template>