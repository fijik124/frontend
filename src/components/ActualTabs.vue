<script setup lang="ts">
import UserComponent from './UcerComponent.vue'

interface ImageItem {
    url: string
    width: string
    height: string
    title: string
}

defineProps<{
    data: ImageItem[]
}>()
</script>

<template>
    <!-- Outer container arranges items horizontally side-by-side -->
    <div class="flex flex-wrap items-center gap-6">
        <!-- Loop renders each item inline inside the container -->
         <a v-for="item in data" :key="item.url" :href="item.url" target="_blank" rel="noopener noreferrer">
        <div class="flex items-center gap-2">
            <UserComponent :url="item.url" :width="item.width" :height="item.height" />
            <p class="text-white text-sm font-medium">{{ item.title }}</p>
        </div>
        </a>
    </div>
</template>