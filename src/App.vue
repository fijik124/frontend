<script setup lang="ts">
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';
import { ref, computed } from 'vue';

const number = ref(0)

onMounted(() => {
  number.value += Math.floor(Math.random() * 100)
})

const premena = ref('')

const dlha = computed(() => {
  if (premena.value.length > 10) {
    return true
  } else {
    return false
  }
})

const rows = ref(0)
const cols = ref(0)

</script>

<template>
  <div class="text-center align-middle justify-center">
    <h1>My lucky number: {{ number }}</h1>
    <p>Riadky: </p> <input v-model="rows"></input>
    <p>Stlpce: </p> <input v-model="cols"></input>
    <textarea v-model="premena" :disabled=dlha :class="dlha" :rows=rows :cols=cols></textarea>

    <button v-if="dlha === true" @click="premena = ''">Zmaž Text</button>

    <p>Premena: {{ premena }}</p>

  </div>
</template>

<style scoped>
  .dlha {
    color: red;
  }

  .kratka {
    color: green;
  }

</style>
