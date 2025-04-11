<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import {
  fetchNextProductCode,
  submitProduct,
  fetchCategories,
  fetchSubcategories,
  fetchProductById,
  updateProduct
} from './ProductForm';
import { PRODUCT_ACTIONS } from '@/constants/products';
import { useRouter } from 'vue-router';
const router = useRouter();
import { useImageStore } from '@/@core/stores/images'
const imageStore = useImageStore()

// Definición de props del componente
const props = defineProps({
  productId: {
    type: Number,
    required: false
  },
  action: {
    type: String,
    required: true,
    validator: value => Object.values(PRODUCT_ACTIONS).includes(value)
  }
});

// Estado del formulario con valores iniciales
const formData = ref({
  code: null,
  name: '',
  description: '',
  price: 0,
  amount: 0,
  state: 'disponible',
  dimension: '',
  weight: 0,
  capacity: '',
  color: [''],
  category_id: null,
  subcategory_id: null
});

// Opciones para selects
const states = ref(['disponible', 'agotado', 'reservado']);
const categories = ref([]);
const subcategories = ref([]);

// Estados de la UI
const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);
const visible = ref(false);
const destacated = ref(false);

/**
 * Carga los datos iniciales necesarios para el formulario
 */
const loadInitialData = async () => {
  try {
    errorMessage.value = null;
    successMessage.value = null;

    // Solo cargar código para creación de productos
    if (props.action === PRODUCT_ACTIONS.CREATE) {
      const codeResponse = await fetchNextProductCode();
      if (codeResponse.success) {
        formData.value.code = codeResponse.data.next_code;
      } else {
        errorMessage.value = codeResponse.message;
      }
    }
  } catch (error) {
    errorMessage.value = "Error al cargar datos iniciales";
    console.error(error);
  }
};

// Función separada para cargar categorías
const loadCategories = async () => {
  try {
    const catResponse = await fetchCategories();
    if (catResponse.success) {
      categories.value = catResponse.data;
      console.log("Categorías cargadas:", categories.value);
    } else {
      errorMessage.value = catResponse.message || "Error al cargar categorías";
    }
  } catch (error) {
    errorMessage.value = "Error al cargar categorías";
    console.error(error);
  }
};

/**
 * Carga los datos de un producto existente para edición/visualización
 */
const loadProductById = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = null;

    const productResponse = await fetchProductById(props.productId);
    if (productResponse.success) {
      // Asignar todos los datos del producto al formulario
      formData.value = {
        ...productResponse.data,
        color: productResponse.data.color || [''],
      };

      imageStore.setImages(productResponse.data.images || []);

      // Asignar estados de los checkboxes
      visible.value = Boolean(productResponse.data.visible);
      destacated.value = Boolean(productResponse.data.destacated);

      console.log(visible.value, destacated.value);

      // Cargar subcategorías para la categoría del producto
      if (productResponse.data.category_id) {
        const subcatResponse = await fetchSubcategories(productResponse.data.category_id);
        if (subcatResponse.success) {
          subcategories.value = subcatResponse.data;
        }
      }
    } else {
      errorMessage.value = productResponse.message || "Error al cargar el producto";
    }
  } catch (error) {
    errorMessage.value = "Error inesperado al cargar el producto";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar datos cuando el componente se monta
onMounted(async () => {
  try {
    // 1. Cargar categorías (siempre necesario)
    await loadCategories();

    // 2. Cargar datos iniciales (código de producto)
    await loadInitialData();

    // 3. Si hay productId, cargar el producto
    if (props.productId) {
      await loadProductById();
    }
  } catch (error) {
    console.error("Error en carga inicial:", error);
    errorMessage.value = "Error al inicializar el formulario";
  }
});

// Título dinámico según la acción (crear/editar/ver)
const title = computed(() => {
  switch (props.action) {
    case PRODUCT_ACTIONS.EDIT: return 'Editar producto';
    case PRODUCT_ACTIONS.SHOW: return 'Detalles del producto';
    default: return 'Añadir Producto';
  }
});

const btnTitle = computed(() => {
  switch (props.action) {
    case PRODUCT_ACTIONS.EDIT: return 'Actualizar';
    case PRODUCT_ACTIONS.SHOW: return 'Editar';
    default: return 'Guardar';
  }
});

const handleMainButtonClick = async () => {
  if (btnTitle.value === 'Editar') {
    // Navegar a la página de edición
    router.push(`/products/edit/${props.productId}`);
  } else if (btnTitle.value === 'Actualizar') {
    // Ejecutar el submit normal
    await handleSubmit();
    router.push(`/products/details/${props.productId}`);
  }
};

// Determina si el formulario es editable
const canWrite = computed(() =>
  [PRODUCT_ACTIONS.CREATE, PRODUCT_ACTIONS.EDIT].includes(props.action)
);


// Watcher para cargar subcategorías cuando cambia la categoría
watch(() => formData.value.category_id, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    try {
      const response = await fetchSubcategories(newVal);
      if (response.success) {
        subcategories.value = response.data;
        // Mantener subcategoría seleccionada si es válida
        if (formData.value.subcategory_id &&
          !response.data.some(sub => sub.value === formData.value.subcategory_id)) {
          formData.value.subcategory_id = null;
        }
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  }
}, { immediate: true });

/**
 * Maneja la eliminación de campos de color
 * @param {number} index - Índice del color a eliminar
 */
const removeColor = (index) => {
  formData.value.color.splice(index, 1);
};

/**
 * Resetea el formulario a sus valores iniciales
 */
const resetForm = async () => {
  formData.value = {
    code: null,
    name: '',
    description: '',
    price: 0,
    amount: 0,
    state: 'disponible',
    dimension: '',
    weight: 0,
    capacity: '',
    color: [''],
    category_id: null,
    subcategory_id: null
  };
  visible.value = false;
  destacated.value = false;

  // Recargar código para nuevo producto
  if (props.action === PRODUCT_ACTIONS.CREATE) {
    const codeResponse = await fetchNextProductCode();
    if (codeResponse.success) {
      formData.value.code = codeResponse.data.next_code;
    }
  }
};

/**
 * Maneja el envío del formulario (creación o actualización)
 */
const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // Validación del formulario
    const validationErrors = [];
    if (!formData.value.name) validationErrors.push('Nombre es requerido');
    if (!formData.value.price) validationErrors.push('Precio es requerido');
    if (!formData.value.amount) validationErrors.push('Cantidad es requerida');
    if (!formData.value.description) validationErrors.push('Descripción es requerida');

    const validColors = formData.value.color.filter(c => c.trim() !== '');
    if (validColors.length === 0) validationErrors.push('Al menos un color es requerido');

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    // Preparar datos para enviar
    const payload = {
      ...formData.value,
      color: validColors,
      price: parseFloat(formData.value.price),
      amount: parseInt(formData.value.amount),
      weight: parseFloat(formData.value.weight || 0),
      visible: visible.value,
      destacated: destacated.value,
      images: imageStore.images.map(img => ({
        url: img.url,
        path: img.path,
        name: img.file?.name,
        size: img.file?.size
      }))
    };

    let response;
    if (props.productId) {
      // Actualización de producto existente
      response = await updateProduct(props.productId, payload);
      if (response.success) {
        successMessage.value = response.message || 'Producto actualizado exitosamente';
        // Recargar datos actualizados
        await loadProductById();
      }
    } else {
      // Creación de nuevo producto
      response = await submitProduct(payload);
      if (response.success) {
        successMessage.value = response.message || 'Producto creado exitosamente';
        resetForm();
        imageStore.clearImages()
      }
    }

    if (!response.success) {
      errorMessage.value = response.message || "Error al procesar el producto";
    }
  } catch (error) {
    errorMessage.value = error.message || "Error inesperado al enviar el formulario";
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const addColorDialog = ref(false)
const newColor = ref(null)
const toggleAddColorDialog = () => {
  addColorDialog.value = !addColorDialog.value;
};
const addNewColor = () => {
  if (newColor.value) {
    formData.value.color.push(newColor.value);
    newColor.value = '';
    toggleAddColorDialog();
  }
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-center justify-md-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4"> {{ title }} </h4>
      </div>

      <div class="d-flex gap-4 align-center flex-wrap">
        <VBtn v-if="props.action != 'SHOW'" variant="outlined" @click="router.go(-1)" color="secondary">Cancelar</VBtn>
        <VBtn v-else variant="outlined" prepend-icon="ri-arrow-left-line" @click="router.go(-1)" color="secondary">Atrás</VBtn>
        <VBtn @click="handleMainButtonClick" prepend-icon="ri-pencil-line" :loading="isLoading" :disabled="isLoading">
          {{ btnTitle }}
        </VBtn>
      </div>
    </div>

    <!-- Mensajes de estado -->
    <VAlert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </VAlert>

    <VAlert v-if="successMessage" type="success" class="mb-4">
      {{ successMessage }}
    </VAlert>

    <VRow>
      <VCol md="8">
        <!-- 👉 Información del Producto -->
        <VCard class="mb-6" title="Información del Producto">
          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField v-model="formData.code" label="Código" readonly />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.name" label="Nombre*" placeholder="Ej: iPhone 13"
                  :rules="[v => !!v || 'Nombre es requerido']" :readonly="!canWrite" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.price" label="Precio*" type="number" step="0.01" :readonly="!canWrite"
                  :rules="[
                    v => !!v || 'Precio es requerido',
                    v => v >= 0 || 'El precio no puede ser negativo'
                  ]" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.amount" label="Cantidad*" type="number" :readonly="!canWrite" :rules="[
                  v => !!v || 'Cantidad es requerida',
                  v => v >= 0 || 'La cantidad no puede ser negativa'
                ]" />
              </VCol>

              <VCol cols="12" md="6">
                <VSelect v-model="formData.state" label="Estado*" :readonly="!canWrite" :items="states"
                  :rules="[v => !!v || 'Estado es requerido']" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.dimension" label="Dimensiones" placeholder="Ej: 16cm x 5cm"
                  :readonly="!canWrite" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.weight" label="Peso (gr)" type="number" :readonly="!canWrite"
                  step="0.01" />
              </VCol>

              <VCol cols="12" md="6">
                <VTextField v-model="formData.capacity" label="Capacidad" placeholder="Ej: 128 GB"
                  :readonly="!canWrite" />
              </VCol>

              <VCol cols="12" class="d-flex w-100 align-center justify-space-between gap-3">
                <v-combobox class="pa-0 ma-0 w-100" v-model="formData.color" :items="formData.color" label="Colores"
                  variant="outlined" chips :clearable="canWrite" :closable-chips="canWrite" multiple readonly :menu-icon="null"
                  hide-no-data append-inner-icon="" hide-details>
                  <template #chip="{ props, item }">
                    <v-chip v-bind="props">
                      <strong>{{ item.raw }}</strong>
                    </v-chip>
                  </template>
                </v-combobox>

                <v-btn icon="ri-add-line" color="primary" @click="toggleAddColorDialog" v-if="canWrite">
                </v-btn>


                <!-- Diálogo para añadir nuevo color -->
                <v-dialog v-model="addColorDialog" max-width="400">
                  <v-card>
                    <v-card-title>Añadir nuevo color</v-card-title>
                    <v-card-text>
                      <v-text-field v-model="newColor" label="Nombre" />
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn text @click="toggleAddColorDialog">Cancelar</v-btn>
                      <v-btn color="primary" @click="addNewColor">Añadir</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </VCol>

              <VCol cols="12">
                <v-textarea :readonly="!canWrite" label="Descripción" v-model="formData.description" variant="outlined"
                  placeholder="Descripción detallada del producto..." class="mt-1 rounded"
                  :rules="[v => !!v || 'Descripción es requerida']" auto-grow></v-textarea>

              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- 👉 Imágenes del Producto -->
        <VCard class="mb-6" title="Imágenes del Producto">
          <VCardText>
            <DropZone :images="formData.images" :readonly="props.action == 'SHOW' ? true : false" />
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="4">
        <!-- 👉 Organización -->
        <VCard title="Organización" class="mb-6">
          <VCardText>
            <div class="d-flex flex-column gap-y-4">
              <div>
                <!-- Tu select de categorías -->
                <VSelect v-model="formData.category_id" label="Categoría*" :items="categories" item-title="title"
                  item-value="value" :rules="[v => !!v || 'Categoría es requerida']" :readonly="!canWrite" clearable
                  :disabled="isLoading" />
              </div>

              <VSelect :readonly="!canWrite" v-model="formData.subcategory_id" label="Subcategoría*"
                :items="subcategories" item-title="title" item-value="value" :disabled="!formData.category_id"
                :rules="[v => !!v || 'Subcategoría es requerida']" clearable />
            </div>
          </VCardText>
        </VCard>

        <!-- 👉 Precios -->
        <VCard class="mb-6">
          <VCardText>
            <VSwitch :readonly="!canWrite" v-model="visible" label="Marcar como visible" />
            <VSwitch :readonly="!canWrite" v-model="destacated" label="Marcar como destacado" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px;
}

.inventory-card {

  .v-radio-group,
  .v-checkbox {
    .v-selection-control {
      align-items: start !important;
    }
  }
}
</style>

<style lang="scss">
.ProseMirror {
  p {
    margin-block-end: 0;
  }

  padding: 0.5rem;
  outline: none;

  p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>
