<template>
  <v-card class="text-center pt-3">
    <v-card-title> {{ props?.category ? 'Editar Categoría' : 'Nueva Categoría' }} </v-card-title>
    <!-- Asumimos que este VForm tiene un ref="form" -->
    <v-form @submit.prevent="handleSubmitCategory()" ref="form" v-model="isFormValid">
      <v-card-text>
        <v-text-field autofocus v-model="name" label="Nombre de la categoría" required :rules="required" class="mb-4">
        </v-text-field>

      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Cancelar" variant="text" @click="emit('close')"></v-btn>
        <v-btn :loading="isLoading" type="submit" :text="props?.category ? 'Actualizar' : 'Añadir'" variant="flat"
          color="primary"></v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { submitCategory, updateCategory } from '../categories'
const giveMeASnack = inject('Snackbar:giveMeASnack')

const props = defineProps({
  category: {
    type: Object,
    default: null,
    required: false
  }
})

const emit = defineEmits(['close'])

const name = ref(props?.category?.name || '')
const isFormValid = ref(false)
const form = ref(null)
const errorMessage = ref(null)
const successMessage = ref(null)
const isLoading = ref(false)

const required = [
  v => v !== null && v !== undefined && v !== '' || 'El campo es obligatorio',
]

const handleSubmitCategory = async () => {
  // Llamamos al método validate() del formulario para actualizar la validez
  const valid = await form.value.validate()
  if (!valid) {
    // Si el formulario no es válido, no se hace la petición
    return
  }

  isLoading.value = true
  try {
    let response
    if (props?.category) {
      response = await updateCategory(props.category.id, {
        name: name.value
      })
    } else {
      response = await submitCategory(name.value)
    }

    if (response.success) {
      giveMeASnack({
        message: props?.category
          ? 'Categoría actualizada correctamente'
          : 'Categoría creada correctamente',
        color: 'success'
      })
      emit('close', true)
    } else {
      giveMeASnack({
        message: errorMessage.value = response.message || 'Error al procesar la categoría',
        color: 'error'
      })
      successMessage.value = null
    }
  } catch (error) {
    giveMeASnack({
      message: error.message || 'Error inesperado al enviar el formulario',
      color: 'error'
    })
    console.error("Error completo:", error)
  } finally {
    isLoading.value = false
  }
}
</script>
