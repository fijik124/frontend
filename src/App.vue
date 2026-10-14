<script setup lang="ts">
import { ref } from 'vue'

const items = ref([{
 name: "Ďuso",
 znamka: 2,
},
{
 name: "Peťo",
 znamka: 3,
}, {
  name: "Fero",
  znamka: 1,
}])

const name = ref<string>('')
const znamka = ref<number>(0)


</script>

<template>
  <div>
    <li v-for="(item, index) in items" key="index">
      {{ index }} - {{ item.name }} - 
	  {{ item.znamka }} <input v-model="item.name" /><button @click="items.splice(index, 1)">Odstrániť</button>
    </li>



  <p>Priemerna znamka: {{ items.reduce((sum, item) => sum + item.znamka, 0) / items.length || 0 }}</p>
  <div><form @submit.prevent>
  <input type="text" v-model="name" />
  <input type="number" v-model.number="znamka" />

  <button
    type="submit"
    @click="items.push({ name, znamka })"
  >
    Pridať
  </button>
</form></div>

	<span v-for="n in 10">{{ n }}</span>

  </div>
</template>




<style scoped>

</style>
