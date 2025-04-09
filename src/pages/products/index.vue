  <script setup>
  import { onMounted } from 'vue'
  import { $axios } from '../../utils/api'
  import { fetchFilters, fetchProducts, updateProduct } from './index'
  import { debounce } from 'lodash';
  import { onClickOutside } from '@vueuse/core';
  import { useRouter } from 'vue-router';


  //data table
  const headers = ref([
    { title: "Código", text: "Código", value: "code" },
    { title: "Nombre", text: "Nombre", value: "name" },
    { title: "Descripción", text: "Descripción", value: "description" },
    { title: "Precio", text: "Precio", value: "price" },
    { title: "Cantidad", text: "Cantidad", value: "amount" },
    { title: "Estado", text: "Estado", value: "state" },
    { title: "Dimensiones", text: "Dimensiones", value: "dimension" },
    { title: "Peso", text: "Peso", value: "weight" },
    { title: "Capacidad", text: "Capacidad", value: "capacity" },
    { title: "Destacado", text: "Destacado", value: "destacated" },
    { title: "Visible", text: "Visible", value: "visible" },
    { title: "Color", text: "Color", value: "color" },
    { title: 'Actions', key: 'actions', sortable: false, },
  ]);

  // Debounce para la búsqueda en tiempo real (300ms de delay)
  const debouncedSearch = debounce(() => {
    getProducts() // Debe llamarse sin parámetros
  }, 300)

  // Manejar cambios en el input de búsqueda
  const onSearchInput = () => {
    pagination.value.page = 1; // Resetear a la primera página
    debouncedSearch();
  };

  const products = ref([])
  const totalProduct = ref(0)

  // Data table options
  const pagination = ref({ page: 1, itemsPerPage: 20, sortBy: null, orderBy: null });
  const updateOptions = options => {
    pagination.value.sortBy = options.sortBy[0]?.key
    pagination.value.orderBy = options.sortBy[0]?.order
    pagination.value.page = options.page
    pagination.value.itemsPerPage = options.itemsPerPage
    getProducts()
  }

  const handleToggleDestacated = async (product) => {
    if (!product) return; // Validación adicional

    try {
      const newValue = !product.destacated;
      const currentProduct = products.value.find(p => p.id === product.id);

      if (!currentProduct) {
        throw new Error('Producto no encontrado');
      }

      // Cambio optimista
      currentProduct.destacated = newValue;

      const response = await updateProduct(product.id, {
        destacated: newValue
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar con datos del servidor
      Object.assign(currentProduct, response.data);

    } catch (error) {
      // Revertir cambio
      const productToRevert = products.value.find(p => p.id === product.id);
      if (productToRevert) {
        productToRevert.destacated = !newValue;
      }
      alert(error.message || 'Error al actualizar');
      console.error(error);
    }
  };

  const handleToggleVisible = async (product) => {
    if (!product) return; // Validación adicional

    try {
      const newValue = !product.visible;
      const currentProduct = products.value.find(p => p.id === product.id);

      if (!currentProduct) {
        throw new Error('Producto no encontrado');
      }

      // Cambio optimista
      currentProduct.visible = newValue;

      const response = await updateProduct(product.id, {
        visible: newValue
      });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar con datos del servidor
      Object.assign(currentProduct, response.data);

    } catch (error) {
      // Revertir cambio
      const productToRevert = products.value.find(p => p.id === product.id);
      if (productToRevert) {
        productToRevert.visible = !newValue;
      }
      alert(error.message || 'Error al actualizar');
      console.error(error);
    }
  };

  const pendingAmountChanges = ref({});

  const handleManualAmountChange = (product, value) => {
    const numericValue = Math.max(0, parseInt(value) || 0);
    pendingAmountChanges.value[product.id] = numericValue;
  };

  // Función de ajuste mejorada
  const adjustAmount = (product, delta) => {
    const current = pendingAmountChanges.value[product.id] ?? product.amount;
    pendingAmountChanges.value[product.id] = Math.max(0, current + delta);
  };

  // Confirmar cambio de cantidad
  const confirmAmountChange = async (product) => {
    try {
      const newAmount = pendingAmountChanges.value[product.id];
      const currentProduct = products.value.find(p => p.id === product.id);

      if (!currentProduct) {
        throw new Error('Producto no encontrado');
      }

      // Cambio optimista
      currentProduct.amount = newAmount;

      const response = await updateProduct(product.id, { amount: newAmount });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar con datos del servidor
      currentProduct.amount = response.data.amount;
      delete pendingAmountChanges.value[product.id];

    } catch (error) {
      // Revertir cambio
      const productToRevert = products.value.find(p => p.id === product.id);
      if (productToRevert) {
        productToRevert.amount = product.amount;
      }
      console.error("Error al actualizar cantidad:", error);
    }
  };

  // Cancelar cambio de cantidad
  const cancelAmountChange = (product) => {
    delete pendingAmountChanges.value[product.id];
  };

  const amountControlWrapper = ref(null);

  onClickOutside(amountControlWrapper, (event) => {
    // Verifica si hay cambios pendientes en algún producto
    for (const [id, value] of Object.entries(pendingAmountChanges.value)) {
      const product = products.value.find(p => p.id === id);
      if (product && value !== product.amount) {
        confirmAmountChange(product);
      }
    }
  });

  const handleBlur = (item) => {
    // Usamos setTimeout para permitir que los clics en los botones se procesen primero
    setTimeout(() => {
      // Solo confirmamos si el valor ha cambiado y no se hizo clic en los botones
      if (pendingAmountChanges.value[item.id] !== undefined &&
        pendingAmountChanges.value[item.id] !== item.amount) {
        confirmAmountChange(item);
      }
    }, 200);
  };

  //filters
  const search = ref("");
  const loading = ref(false);
  const categories = ref([]);
  const selectedCategory = ref(null);
  const selectedSubCategory = ref([]);
  const subCategories = ref([]);
  const computedSubcategories = ref([]);
  const selectedDestacated = ref(null);
  const selectedVisible = ref(null);

  //functions
  const getProducts = async () => {
    loading.value = true;
    const response = await fetchProducts(
      pagination.value.page,
      pagination.value.itemsPerPage,
      pagination.value.sortBy,
      pagination.value.orderBy,
      selectedCategory.value,
      selectedSubCategory.value,
      search.value,
      selectedDestacated.value,
      selectedVisible.value
    )

    if (!response.success) {
      alert(response.message)
      return
    }

    products.value = response.data
    totalProduct.value = response.meta.total
    loading.value = false;
  }

  const getFilters = async () => {
    const response = await fetchFilters()

    if (!response.success) {
      alert(response.message)
      return
    }

    console.log('reqeust', response.data);


    categories.value = response.data.map((item) => ({
      title: item.name,
      value: item.id
    }));
    console.log('cat', categories.value);

    subCategories.value = response.data.map(item => ({
      category_id: item.id,
      subcategories: item.subcategories.map(sub => ({
        title: sub.name,
        value: sub.id,
      }))
    }));

    computedSubcategories.value = subCategories.value;
    console.log("Computed", computedSubcategories.value);

  }

  const handleSubcategoryChange = (value) => {
    selectedSubCategory.value = Array.isArray(value) ? value : [value];
  };

  const decrementAmount = async (product) => {
    try {
      if (!product || product.amount === undefined) {
        throw new Error("Producto no válido");
      }

      if (product.amount <= 0) return;

      const newAmount = product.amount - 1;
      product.amount = newAmount; // Cambio optimista

      const response = await updateProduct(product.id, { amount: newAmount });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar con datos del servidor
      product.amount = response.data.amount;
    } catch (error) {
      if (product) product.amount += 1; // Revertir si hay error
      console.error("Error en decrementAmount:", error);
    }
  };

  const incrementAmount = async (product) => {
    try {
      if (!product || product.amount === undefined) {
        throw new Error("Producto no válido");
      }

      if (product.amount <= 0) return;

      const newAmount = product.amount + 1;
      product.amount = newAmount; // Cambio optimista

      const response = await updateProduct(product.id, { amount: newAmount });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Actualizar con datos del servidor
      product.amount = response.data.amount;
    } catch (error) {
      if (product) product.amount += 1; // Revertir si hay error
      console.error("Error en decrementAmount:", error);
    }
  };

  const router = useRouter();

  // Función específica para navegar a detalles
  const goToProductDetails = (productId) => {
    router.push(`/products/details/${productId}`);
  };

  watch([selectedCategory, selectedSubCategory], () => {
    getProducts();
  });

  watch(search, () => {
    console.log(search);

    debouncedSearch()
  })

  // Watcher para actualizar subcategorías cuando cambia la categoría
  watch(selectedCategory, () => {
    computedSubcategories.value = [];
    if (selectedCategory.value) {
      const category = subCategories.value.find(
        el => el.category_id === selectedCategory.value
      );
      if (category) {
        computedSubcategories.value = [...category.subcategories];
      }
    } else {
      // Mostrar todas las subcategorías si no hay categoría seleccionada
      computedSubcategories.value = subCategories.value.flatMap(
        cat => cat.subcategories
      );
    }
    selectedSubCategory.value = []; // Resetear subcategorías seleccionadas
  });

  onMounted(() => {
    getProducts()
    getFilters();
  })



</script>

  <template>
    <div>
      <!-- 👉 products -->
      <VCard title="Filters">
        <VCardText>
          <VRow>
            <!-- 👉 Select Category -->
            <VCol cols="12" sm="6">
              <VSelect v-model="selectedCategory" label="Categoría" placeholder="Seleccionar Categoría"
                :items="categories" clearable clear-icon="ri-close-line" />
            </VCol>

            <!-- 👉 Select SubCategory -->
            <VCol cols="12" sm="6">
              <VSelect v-model="selectedSubCategory" label="Subcategoría" placeholder="Seleccionar Subcategoría"
                :items="computedSubcategories" @change="handleSubcategoryChange" chips clearable multiple
                clear-icon="ri-close-line" />
            </VCol>


          </VRow>
          <VRow>
            <!-- 👉 Select Destacado -->
            <VCol cols="12" sm="6">
              <v-card variant="flat">
                <v-radio-group v-model="selectedDestacated" inline @change="getProducts">
                  <h3 class="font-weight-thin pa-2">Destacados</h3>
                  <v-radio label="Si" :value="1"></v-radio>
                  <v-radio label="No" :value="0"></v-radio>
                  <v-radio label="Todos" :value="null"></v-radio>
                </v-radio-group>
              </v-card>
            </VCol>
            <!-- 👉 Select Visible -->
            <VCol cols="12" sm="6">
              <v-card variant="flat">
                <v-radio-group v-model="selectedVisible" inline @change="getProducts">
                  <h3 class="font-weight-thin pa-2">Visibles</h3>
                  <v-radio label="Si" :value="1"></v-radio>
                  <v-radio label="No" :value="0"></v-radio>
                  <v-radio label="Todos" :value="null"></v-radio>
                </v-radio-group>
              </v-card>
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardText class="d-flex flex-wrap gap-4">
          <VRow>
            <VCol cols="12" sm="6">
              <!-- 👉 Search  -->
              <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar productos" density="compact"
                prepend-inner-icon="ri-search-line" clearable style="inline-size: 350px;" />
            </VCol>
            <VCol class="d-flex justify-end" cols="12" sm="6">
              <!-- 👉 Export button -->
              <VBtn class="me-5" variant="outlined" color="secondary" prepend-icon="ri-external-link-line">
                Export
              </VBtn>
              <VBtn color="primary" prepend-icon="ri-add-line" @click="$router.push('/products/add')">
                Agregar Producto
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>

        <!-- 👉 Datatable  -->
        <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
          :loading="loading" loading-text="Cargando..." :items="products" :items-length="totalProduct"
          class="text-no-wrap rounded-0" @update:options="updateOptions">

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>

          <!-- product  -->
          <template #item.product="{ item }">
            <div class="d-flex align-center gap-x-4">
              <VAvatar v-if="item.image" size="38" variant="tonal" rounded :image="item.image" />
              <div class="d-flex flex-column">
                <span class="text-base text-high-emphasis font-weight-medium">{{ item.productName }}</span>
                <span class="text-sm">{{ item.productBrand }}</span>
              </div>
            </div>
          </template>

          <!-- amount -->
          <template #item.amount="{ item }">
            <div class="d-flex align-center gap-2" ref="amountControlWrapper">
              <!-- Botón decremento -->
              <VBtn icon size="x-small" density="compact" color="white"
                :disabled="(pendingAmountChanges[item.id] ?? item.amount) <= 0" @click="adjustAmount(item, -1)">
                <h2>-</h2>
              </VBtn>

              <!-- Campo de cantidad con contenedor -->
              <div @click.stop>
                <VTextField :model-value="pendingAmountChanges[item.id] ?? item.amount" type="number" density="compact"
                  width="150px" hide-details @update:model-value="(value) => handleManualAmountChange(item, value)"
                  @blur="handleBlur(item)" ref="amountInput">

                  <!-- Botones de confirmación -->
                  <div v-if="pendingAmountChanges[item.id] !== undefined">
                    <VBtn icon color="white" class="elevation-0" density="compact" size="x-small"
                      @click="confirmAmountChange(item)">
                      <h6>✔</h6>
                    </VBtn>
                    <VBtn icon color="white" class="elevation-0" density="compact" size="x-small"
                      @click="cancelAmountChange(item)">
                      <h6>✖</h6>
                    </VBtn>
                  </div>
                </VTextField>
              </div>

              <!-- Botón incremento -->
              <VBtn icon size="x-small" density="compact" color="white" @click="adjustAmount(item, +1)">
                <h2>+</h2>
              </VBtn>
            </div>
          </template>

          <template #item.description="{ item }">
            <div class="text-wrap" style="min-width: 500px; max-width: 800px;">
              {{ item.description }}
            </div>
          </template>

          <!-- category -->
          <template #item.category="{ item }">
            <VAvatar size="30" variant="tonal" :color="resolveCategory(item.category)?.color" class="me-4">
              <VIcon :icon="resolveCategory(item.category)?.icon" size="18" />
            </VAvatar>
            <span class="text-base text-high-emphasis">{{ item.category }}</span>
          </template>

          <!-- destacated -->
          <template #item.destacated="{ item }">
            <VSwitch :model-value="item?.destacated ?? false" @update:model-value="handleToggleDestacated(item)"
              color="primary" inset hide-details />
          </template>

          <!-- visible -->
          <template #item.visible="{ item }">
            <VSwitch :model-value="item?.visible ?? false" @update:model-value="handleToggleVisible(item)"
              color="primary" inset hide-details />
          </template>

          <template #item.color="{ item }">

            <VChip class="mx-1" v-for="(color) in item.color" size="x-small">
              {{ color }}
            </VChip>

          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn size="small" color="warning" @click="() => goToProductDetails(item.id)">
              👁‍🗨
            </IconBtn>

            <IconBtn size="small">
              <!-- <VIcon icon="ri-more-2-fill" /> -->
              ⁝
              <VMenu activator="parent">
                <VList>
                  <VListItem value="download" prepend-icon="ri-download-line">
                    Download
                  </VListItem>

                  <VListItem value="delete" prepend-icon="ri-delete-bin-line" @click="deleteProduct(item.id)">
                    Delete
                  </VListItem>

                  <VListItem value="duplicate" prepend-icon="ri-stack-line">
                    Duplicate
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
          </template>

        </VDataTableServer>
      </VCard>
    </div>
  </template>
