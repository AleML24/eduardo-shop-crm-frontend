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
import AddCategory from '../components/AddCategory.vue'
import AddSubcategory from '../components/AddSubcategory.vue'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay() // Obtiene las propiedades de pantalla

// Puedes definir una propiedad que determine si el dispositivo es móvil 
const isMobile = computed(() => mobile.value)
const giveMeASnack = inject('Snackbar:giveMeASnack')



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
const selectedCategory = ref(null)
const selectedSubcategory = ref(null)

// Obtener categorías al montar
onMounted(() => {
  getCategories()
})

// Obtener categorías
const getCategories = async () => {
  try {
    isLoading.value = true
    const response = await fetchCategories()
    if (!response.success) {
      giveMeASnack({
        message: response.message,
        color: 'error'
      })
      return
    }
    categories.value = response.data
  } catch (error) {
    giveMeASnack({
      message: "Error al cargar las categorías",
      color: 'error'
    })
  }
  isLoading.value = false
}

// Diálogo para categorías
const openDialogCategory = (category = null) => {
  if (category) {
    isEditingCategory.value = true
    currentCategoryId.value = category.id
    selectedCategory.value = category
  } else {
    isEditingCategory.value = false
    currentCategoryId.value = null
    selectedCategory.value = null
  }
  errorMessage.value = null
  successMessage.value = null
  dialogCategory.value = true
}


// Eliminar Categoría
const handleDeleteCategory = async (categoryId) => {
  isLoading.value = true
  try {
    const response = await deleteCategory(categoryId)
    if (response.success) {
      giveMeASnack({
        message: 'Categoría eliminada correctamente',
        color: 'success'
      })
      dialogConfirmDeleteCategory.value = false
      await getCategories()
    } else {
      giveMeASnack({
        message: 'Error al eliminar categoría',
        color: 'error'
      })
    }
  } catch (error) {
    giveMeASnack({
      message: 'Error inesperado al eliminar categoría',
      color: 'error'
    })
    console.error("Error completo:", error)
  }
  isLoading.value = false
}

// Eliminar subcategoría
const handleDeleteSubcategory = async (subcategoryId) => {
  isLoading.value = true
  try {
    const response = await deleteSubcategory(subcategoryId)
    if (response.success) {
      giveMeASnack({
        message: "Subcategoría eliminada correctamente",
        color: 'error'
      })
      await getCategories()
      dialogConfirmDeleteSubcategory.value = false
    } else {
      giveMeASnack({
        message: "Error al eliminar la subcategoría",
        color: 'error'
      })
      errorMessage.value = response.message || 'Error al eliminar subcategoría'
    }
  } catch (error) {
    giveMeASnack({
      message: "Error al eliminar la subcategoría",
      color: 'error'
    })
    console.error("Error completo:", error)
  }
  isLoading.value = false
  cancelDelete()
  getCategories()
}

const subcategoryToDelete = ref(null)
const categoryToDelete = ref(null)

const openDeleteCategoryDialog = (subcategory) => {
  categoryToDelete.value = subcategory
  dialogConfirmDeleteCategory.value = true
}

const cancelDelete = () => {
  dialogConfirmDeleteSubcategory.value = false
  dialogConfirmDeleteCategory.value = false
  subcategoryToDelete.value = false;
}

const closeCategoryDialog = (success) => {
  dialogCategory.value = false
  success ? getCategories() : null
}

const selectedSubCategory = ref(null)
const selectedCategoryId = ref(null)
const showSubcategoryDialog = (categoryId, subcategory = null) => {
  selectedCategoryId.value = categoryId,
    selectedSubCategory.value = subcategory
  dialogSubcategory.value = true
}

const hideSubcategoryDialog = (success) => {
  selectedCategoryId.value = null
  selectedSubCategory.value = null
  dialogSubcategory.value = false
  success ? getCategories() : null
}

</script>

<template>
  <div class="d-flex w-100 h-100 justify-center">
    <VCard style="max-width: 1000px;" class="pa-md-3" :loading="isLoading" :disabled="isLoading">
      <!-- Sección de Categorías -->
      <v-card-title class="pt-5 d-flex justify-space-between align-center">
        <v-card-title class="text-h3">Categorías</v-card-title>
        <v-btn v-if="!isMobile" v-model="dialogCategory" prepend-icon="ri-add-line" variant="flat" class="mr-3"
          @click="openDialogCategory()">Añadir
        </v-btn>
        <v-btn v-else v-model="dialogCategory" variant="flat" icon="ri-add-line" @click="openDialogCategory()"></v-btn>
        <v-dialog v-model="dialogCategory" max-width="400">
          <add-category :category="selectedCategory" @close="(success) => closeCategoryDialog(success)"></add-category>
        </v-dialog>
      </v-card-title>

      <VCardText>
        <div>
          <v-expansion-panels class="my-4" variant="popout">
            <v-expansion-panel v-for="category in categories" :key="category.id">
              <template #title>
                <div class="d-flex align-center justify-space-between w-100">
                  <div class="text-h5 text-md-h5" style="font-weight: 400; color: hsla(0, 0%, 0%, 0.6);">
                    {{ category.name }}
                  </div>
                  <div class="d-flex justif-center mx-1">
                    <v-btn :size="isMobile ? 'small' : 'medium'" icon="ri-edit-box-line" variant="text"
                      @click.stop="openDialogCategory(category)"></v-btn>
                    <v-btn :size="isMobile ? 'small' : 'medium'" @click.stop="openDeleteCategoryDialog(category)"
                      icon="ri-delete-bin-line" variant="text" color="error">
                    </v-btn>

                  </div>

                </div>
              </template>

              <template #text>
                <v-list style="overflow-x: hidden;">
                  <v-row class="px-5 my-3 d-flex justify-space-between align-center">
                    <div class="text-h6 text-md-h6">
                      Subcategorías
                    </div>
                    <v-btn v-if="!isMobile" v-model="dialogSubcategory" class="rounded" text="Añadir"
                      prepend-icon="ri-add-line" @click="showSubcategoryDialog(category.id, null)"></v-btn>
                    <v-btn v-else v-model="dialogSubcategory" size="small" icon="ri-add-line"
                      @click="showSubcategoryDialog(category.id, null)"></v-btn>
                  </v-row>
                  <v-divider inset class="my-2" style="max-width: 100% !important; margin-inline-start: 0;"></v-divider>

                  <!-- Lista de subcategorías -->
                  <v-list-item v-for="subcategory in category.subcategories" :key="subcategory.id"
                    :value="subcategory.id">
                    <template v-slot>
                      <div class="px-md-2 d-flex align-center" style="justify-content: space-between; width: 100%;">
                        <!-- Contenedor del texto, se ajusta al espacio disponible y envuelve el contenido -->
                        <div style="flex: 1; word-break: break-word; white-space: normal;">
                          <span class="text-body-1 text-md-h6" style="color: hsla(0, 0%, 0%, 0.6);">
                            {{ subcategory.name }}
                          </span>
                        </div>
                        <!-- Contenedor de los botones, sin permitir wrap -->
                        <div style="white-space: nowrap; margin-left: 8px;">
                          <v-btn density="compact" size="medium" variant="text" color="" icon="ri-edit-box-line"
                            @click.stop="showSubcategoryDialog(category.id, subcategory)">
                          </v-btn>
                          <v-btn @click="showSubcategoryDialog(category.id, subcategory)" icon="ri-delete-bin-line"
                            density="comfortable" variant="text" color="error">
                          </v-btn>
                        </div>
                      </div>
                    </template>

                  </v-list-item>


                </v-list>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </VCardText>

      <!-- Dialog de agregar subcategoría -->
      <v-dialog v-model="dialogSubcategory" max-width="400">
        <add-subcategory :subcategory="selectedSubCategory" :categoryId="selectedCategoryId"
          @close="(success) => hideSubcategoryDialog(success)"></add-subcategory>
      </v-dialog>


      <!-- Dialog de confirmacion de eliminacion de Categorías -->
      <v-dialog v-model="dialogConfirmDeleteCategory" width="auto">
        <v-card class="pa-5" max-width="400" title="Confirmar eliminar">
          <v-card-text>
            ¿Está seguro de eliminar "{{ categoryToDelete.name }}" y todos sus elementos asociados?
          </v-card-text>
          <v-card-actions class="d-flex justify-end gap-3">
            <v-btn :loading="isLoading" @click="cancelDelete" variant="outlined">
              Cancelar
            </v-btn>
            <v-btn :loading="isLoading" variant="elevated" color="error"
              @click.stop="handleDeleteCategory(categoryToDelete.id)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog de confirmacion de eliminacion de subcategorías -->
      <v-dialog v-model="dialogConfirmDeleteSubcategory" width="auto">
        <v-card class="pa-5" max-width="400" title="Confirmar eliminar">
          <v-card-text>
            ¿Está seguro de eliminar "{{ subcategoryToDelete.name }}" y todos sus elementos asociados?
          </v-card-text>
          <v-card-actions class="d-flex justify-end gap-3">
            <v-btn :loading="isLoading" @click="cancelDelete()" variant="outlined">
              Cancelar
            </v-btn>
            <v-btn :loading="isLoading" variant="elevated" color="error"
              @click.stop="handleDeleteSubcategory(subcategoryToDelete.id)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </VCard>
  </div>

</template>
