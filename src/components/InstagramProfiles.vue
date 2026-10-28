<script setup lang="ts">
import UserComponent from './UcerComponent.vue'

interface ImageItem {
    url: string
    width: string
    height: string
    name: string
}

defineProps<{
    data: ImageItem[]
}>()
</script>

<template>
    <div class="flex flex-wrap items-center gap-6">
        <a v-for="item in data" :key="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">
            <!-- flex-col stacks image and name vertically -->
            <div class="flex flex-col items-center gap-2">
                <UserComponent :url="item.url" :width="item.width" :height="item.height" />
                <p class="text-white text-sm font-medium">{{ item.name }}</p>
            </div>
        </a>
    </div>
</template>