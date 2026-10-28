<script setup lang="ts">
import { ref } from 'vue'
import blog from '@/components/blog.vue'
import ActualTabs from './components/ActualTabs.vue';
import InstagramProfiles from './components/InstagramProfiles.vue';

const data = ref([
    { url: 'https://picsum.photos/200/200', width: '45', height: '45', title: 'Image 1' },
    { url: 'https://picsum.photos/200/202', width: '45', height: '45', title: 'Image 2' },
    { url: 'https://picsum.photos/200/201', width: '45', height: '45', title: 'Image 3' }
])

const datai = ref([
    { url: 'https://picsum.photos/200/200', width: '66', height: '66', name: 'Profile 1' },
    { url: 'https://picsum.photos/200/202', width: '66', height: '66', name: 'Profile 2' },
    { url: 'https://picsum.photos/200/201', width: '66', height: '66', name: 'Profile 3' }
])


</script>

<template>
<actual-tabs :data="data" />
<instagram-profiles :data="datai" />
</template>




<style scoped>

</style>
