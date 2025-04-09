<script setup>
import { ref, onMounted } from 'vue'
import {
  fetchCategories,
  submitCategory,
  updateCategory,
  submitSubcategory,
  updateSubcategory,
  deleteSubcategory,
  deleteCategory,

} from './index'

// Estados para categorías
const categories = ref([])
const dialogCategory = ref(false)
const dialogConfirmDeleteCategory = ref(false)
const dialogConfirmDeleteSubcategory = ref(false)
const isEditingCategory = ref(false)
const currentCategoryId = ref(null)


// Estados para subcategorías
const dialogSubcategory = ref(false)
const isEditingSubcategory = ref(false)
const currentSubcategoryId = ref(null)
const currentParentCategoryId = ref(null)

// Estados compartidos
const errorMessage = ref(null)
const successMessage = ref(null)
const isLoading = ref(false)

// Formularios
const categoryForm = ref({
  name: ''
})

const subcategoryForm = ref({
  name: '',
  category_id: null
})

// Obtener categorías al montar
onMounted(() => {
  getCategories()
})

// Obtener categorías
const getCategories = async () => {
  try {
    const response = await fetchCategories()
    if (!response.success) {
      alert(response.message)
      return
    }
    categories.value = response.data
  } catch (error) {
    console.error("Error fetching categories:", error)
    alert("Error al cargar las categorías")
  }
}

// Diálogo para categorías
const openDialogCategory = (category = null) => {
  if (category) {
    isEditingCategory.value = true
    currentCategoryId.value = category.id
    categoryForm.value = { name: category.name }
  } else {
    isEditingCategory.value = false
    currentCategoryId.value = null
    categoryForm.value = { name: '' }
  }
  errorMessage.value = null
  successMessage.value = null
  dialogCategory.value = true
}

// Diálogo para subcategorías
const openDialogSubcategory = (subcategory = null, categoryId = null) => {
  if (subcategory) {
    isEditingSubcategory.value = true
    currentSubcategoryId.value = subcategory.id
    currentParentCategoryId.value = subcategory.category_id
    subcategoryForm.value = {
      name: subcategory.name,
      category_id: subcategory.category_id
    }
  } else {
    isEditingSubcategory.value = false
    currentSubcategoryId.value = null
    currentParentCategoryId.value = categoryId
    subcategoryForm.value = {
      name: '',
      category_id: categoryId
    }
  }
  errorMessage.value = null
  successMessage.value = null
  dialogSubcategory.value = true
}

// Submit para categorías
const handleSubmitCategory = async () => {
  errorMessage.value = null
  successMessage.value = null
  isLoading.value = true

  try {
    if (!categoryForm.value.name.trim()) {
      throw new Error('El nombre de la categoría es requerido')
    }

    let response
    if (isEditingCategory.value) {
      response = await updateCategory(currentCategoryId.value, {
        name: categoryForm.value.name
      })
    } else {
      response = await submitCategory(categoryForm.value)
    }

    if (response.success) {
      successMessage.value = isEditingCategory.value
        ? 'Categoría actualizada correctamente'
        : 'Categoría creada correctamente'
      await getCategories()
      setTimeout(() => dialogCategory.value = false, 1500)
    } else {
      errorMessage.value = response.message || 'Error al procesar la categoría'
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error inesperado al enviar el formulario'
    console.error("Error completo:", error)
  } finally {
    isLoading.value = false
  }
}

// Eliminar categoria
const handleDeleteCategory = async (categoryId) => {
  try {
    const response = await deleteCategory(categoryId)
    if (response.success) {
      successMessage.value = response.message || 'Subcategoría eliminada correctamente'
      await getCategories()
      dialogConfirmDeleteCategory.value = false
    } else {
      errorMessage.value = response.message || 'Error al eliminar subcategoría'
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado al eliminar subcategoría'
    console.error("Error completo:", error)
  }
}

// Submit para subcategorías
const handleSubmitSubcategory = async () => {
  errorMessage.value = null
  successMessage.value = null
  isLoading.value = true

  try {
    if (!subcategoryForm.value.name.trim()) {
      throw new Error('El nombre de la subcategoría es requerido')
    }

    const payload = {
      name: subcategoryForm.value.name,
      category_id: subcategoryForm.value.category_id
    }

    let response
    if (isEditingSubcategory.value) {
      response = await updateSubcategory(currentSubcategoryId.value, payload)
    } else {
      response = await submitSubcategory(payload)
    }

    if (response.success) {
      successMessage.value = isEditingSubcategory.value
        ? 'Subcategoría actualizada correctamente'
        : 'Subcategoría creada correctamente'
      await getCategories()
      setTimeout(() => dialogSubcategory.value = false, 1500)
    } else {
      errorMessage.value = response.message || 'Error al procesar la subcategoría'
    }
  } catch (error) {
    errorMessage.value = error.message || 'Error inesperado al enviar el formulario'
    console.error("Error completo:", error)
  } finally {
    isLoading.value = false
  }
}

// Eliminar subcategoría
const handleDeleteSubcategory = async (subcategoryId) => {
  try {
    const response = await deleteSubcategory(subcategoryId)
    if (response.success) {
      successMessage.value = response.message || 'Subcategoría eliminada correctamente'
      await getCategories()
      dialogConfirmDeleteSubcategory.value = false
    } else {
      errorMessage.value = response.message || 'Error al eliminar subcategoría'
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado al eliminar subcategoría'
    console.error("Error completo:", error)
  }
}

// Reset forms
const resetForms = () => {
  categoryForm.value = { name: '' }
  subcategoryForm.value = { name: '', category_id: null }
}
</script>

<template>
  <container>
    <VCard class="pa-10">
      <!-- Sección de Categorías -->
      <v-row>
        <v-col cols="12" sm="6">
          <v-card-title class="text-h4 font-weight-thin">Categorías</v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="12" sm="6">
          <v-dialog v-model="dialogCategory" max-width="500" @after-leave="resetForms">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn v-bind="activatorProps" text="Agregar" variant="flat" @click="openDialogCategory()"></v-btn>
            </template>
            <v-card :title="isEditingCategory ? 'Editar Categoría' : 'Nueva Categoría'">
              <v-card-text>
                <v-form @submit.prevent="handleSubmitCategory">
                  <v-text-field v-model="categoryForm.name" label="Nombre de la categoría" required
                    class="mb-4"></v-text-field>

                  <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                    {{ errorMessage }}
                  </v-alert>

                  <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                    {{ successMessage }}
                  </v-alert>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text="Cancelar" variant="text" @click="dialogCategory = false"></v-btn>
                <v-btn :loading="isLoading" :text="isEditingCategory ? 'Actualizar' : 'Crear'" variant="flat"
                  color="primary" @click="handleSubmitCategory"></v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>

      <VCardText>
        <div>
          <v-expansion-panels class="my-4" variant="popout">
            <v-expansion-panel v-for="category in categories" :key="category.id">
              <template #title>
                <div class="d-flex align-center justify-space-between w-100">
                  <div class="text-h4 font-weight-thin">
                    {{ category.name }}
                  </div>
                  <div class="d-flex justif-center">
                    <v-btn density="comfortable" icon variant="text" color="warning"
                      @click.stop="openDialogCategory(category)">M</v-btn>

                    <v-btn @click="dialogConfirmDeleteCategory = true" icon density="comfortable" variant="text"
                      color="error">
                      D
                    </v-btn>

                    <!-- Dialog de confirmacion de eliminacion de Categorias -->
                    <v-dialog v-model="dialogConfirmDeleteCategory" width="auto">
                      <v-card class="pa-5" max-width="400" title="Confirmar eliminar">
                        <v-card-text>
                          ¿Está seguro de eliminar "{{ category.name }}" y todos sus elementos asociados?
                        </v-card-text>
                        <template v-slot:actions>
                          <v-row>
                            <v-col cols="12">
                              <v-btn variant="text" block color="error"
                                @click.stop="handleDeleteCategory(category.id)">Eliminar</v-btn>
                            </v-col>
                            <v-col cols="12">
                              <v-btn @click="dialogConfirmDeleteCategory = false" block variant="text">
                                Cancelar
                              </v-btn>
                            </v-col>
                          </v-row>
                        </template>
                      </v-card>
                    </v-dialog>

                  </div>

                </div>
              </template>

              <template #text>
                <v-list>
                  <v-row class="mx-5">
                    <v-col cols="12" sm="6">
                      <div class="text-h6 font-weight-thin">
                        Subcategorías
                      </div>
                    </v-col>
                    <v-col class="d-flex justify-end" cols="12" sm="6">
                      <v-dialog v-model="dialogSubcategory" max-width="500" @after-leave="resetForms">
                        <template v-slot:activator="{ props: activatorProps }">
                          <v-btn v-bind="activatorProps" size="x-small" text="Agregar"
                            @click="openDialogSubcategory(null, category.id)"></v-btn>
                        </template>
                        <v-card :title="isEditingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'">
                          <v-card-text>
                            <v-form @submit.prevent="handleSubmitSubcategory">
                              <v-text-field v-model="subcategoryForm.name" label="Nombre de la subcategoría" required
                                class="mb-4"></v-text-field>

                              <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                                {{ errorMessage }}
                              </v-alert>

                              <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
                                {{ successMessage }}
                              </v-alert>
                            </v-form>
                          </v-card-text>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text="Cancelar" variant="text" @click="dialogSubcategory = false"></v-btn>
                            <v-btn :loading="isLoading" :text="isEditingSubcategory ? 'Actualizar' : 'Crear'"
                              variant="flat" color="primary" @click="handleSubmitSubcategory"></v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                  <v-divider inset class="mt-1"></v-divider>

                  <!-- Lista de subcategorías -->
                  <v-list-item v-for="subcategory in category.subcategories" :key="subcategory.id"
                    :title="subcategory.name" :value="subcategory.id">
                    <template v-slot:append>
                      <div class="pa-2">
                        <v-btn density="compact" variant="text" color="warning" icon
                          @click.stop="openDialogSubcategory(subcategory, category.id)">M</v-btn>

                        <v-btn @click="dialogConfirmDeleteSubcategory = true" icon density="comfortable" variant="text"
                          color="error">
                          D
                        </v-btn>

                        <!-- Dialog de confirmacion de eliminacion de Subcategorias -->
                        <v-dialog v-model="dialogConfirmDeleteSubcategory" width="auto">
                          <v-card class="pa-5" max-width="400" title="Confirmar eliminar">
                            <v-card-text>
                              ¿Está seguro de eliminar "{{ subcategory.name }}" y todos sus elementos asociados?
                            </v-card-text>
                            <template v-slot:actions>
                              <v-row>
                                <v-col cols="12">
                                  <v-btn variant="text" block color="error"
                                    @click.stop="handleDeleteSubcategory(subcategory.id)">Eliminar</v-btn>
                                </v-col>
                                <v-col cols="12">
                                  <v-btn @click="dialogConfirmDeleteSubcategory = false" block variant="text">
                                    Cancelar
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </template>
                          </v-card>
                        </v-dialog>


                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </VCardText>
    </VCard>


  </container>
</template>