<template>
  <v-card :title="props?.subcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'">
    <v-form @submit.prevent="handleSubmitSubcategory()" ref="form" v-model="isFormValid">
      <v-card-text>
        <v-text-field :rules="required" v-model="name" label="Nombre de la subcategoría" required
          class="mb-4"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Cancelar" variant="text" @click="dialogSubcategory = false"></v-btn>
        <v-btn :loading="isLoading" :text="props?.subcategory ? 'Actualizar' : 'Crear'" variant="flat" color="primary"
          @click="handleSubmitSubcategory"></v-btn>
      </v-card-actions>
    </v-form>

  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { submitCategory, submitSubcategory, updateCategory, updateSubcategory } from '../categories'
const giveMeASnack = inject('Snackbar:giveMeASnack')

const props = defineProps({
  subcategory: {
    type: Object,
    default: null,
    required: false
  },
  categoryId: {
    type: Number,
    default: null,
    required: true
  }
})

const emit = defineEmits(['close'])

const name = ref(props?.subcategory?.name || '')
const isFormValid = ref(false)
const form = ref(null)
const errorMessage = ref(null)
const successMessage = ref(null)
const isLoading = ref(false)

const required = [
  v => v !== null && v !== undefined && v !== '' || 'El campo es obligatorio',
]

const handleSubmitSubcategory = async () => {
  // Llamamos al método validate() del formulario para actualizar la validez
  const valid = await form.value.validate()

  if (!valid) {
    // Si el formulario no es válido, no se hace la petición
    return
  }

  isLoading.value = true
  try {
    let response
    const payload = {
      name: name.value,
      category_id: props.categoryId
    }

    if (props?.subcategory) {
      response = await updateSubcategory(props.subcategory.id, payload)
    } else {
      response = await submitSubcategory(payload)
    }

    if (response.success) {
      giveMeASnack({
        message: props?.subcategory
          ? 'Subactegoría actualizada correctamente'
          : 'Subactegoría creada correctamente',
        color: 'success'
      })
      emit('close', true)
    } else {
      giveMeASnack({
        message: errorMessage.value = response.message || 'Error al procesar la categoría',
        color: 'error'
      })
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error inesperado al enviar el formulario'
    console.error("Error completo:", error)
  } finally {
    isLoading.value = false
  }
}

</script>
