<script setup lang="ts">
import { ref } from 'vue'
import Articles from '@/components/Articles.vue'

const articles = [
    { id: 1, title: 'Article 1', text: 'This is the first article.' },
    { id: 2, title: 'Article 2', text: 'This is the second article.' },
    { id: 3, title: 'Article 3', text: 'This is the third article.' }
]

const postFontSize = ref(1)


</script>

<template>
    <div :style="{ fontSize: postFontSize + 'em' }">
        <Articles v-for="article in articles" :key="article.id" :title="article.title" :text="article.text" @enlarge-text="postFontSize += 0.1"/>
    </div>
</template>




<style scoped>

</style>
