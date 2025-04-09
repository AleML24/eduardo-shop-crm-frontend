<script setup>
import { fetchCategories } from './index'

onMounted(() => {
  getCategories()
})

const categories = ref(null);

const getCategories = async () => {
  const response = await fetchCategories()
  categories.value = response.value;
  console.log("Catgorias cargadas", categories.data);
  

  if (!response.success) {
    alert(response.message)
    return
  }
  categories.value = response.data
}
</script>

<template>
  <div>
    <VCard title="Create Awesome 🙌">
      <VCardText>Listado de Categorías</VCardText>
      <VCardText>
        <div>
          <v-expansion-panels class="my-4" variant="popout">
            <v-expansion-panel v-for="i in 3" :key="i"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
              title="Item"></v-expansion-panel>
          </v-expansion-panels>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
