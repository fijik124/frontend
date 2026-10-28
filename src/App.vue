<script setup lang="ts">
import { ref, watch } from 'vue'
import blog from '@/components/blog.vue'
import ComponentA from '@/components/componenta.vue'
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

const inputa = ref(0)
const message = ref('')

watch(inputa, (newValue, oldValue) => {
    if (newValue < 0) {
        inputa.value = 0
    }
    if (newValue > 100) {
        inputa.value = 100
    }
    message.value = `Hodnota byla změněna z ${oldValue} na ${newValue}`
})
</script>

<template>
<input v-model="inputa" type="number" placeholder="Zadejte číslo" />
<ComponentA :cifra="inputa" />
<p>{{ message }}</p>
</template>




<style scoped>

</style>
