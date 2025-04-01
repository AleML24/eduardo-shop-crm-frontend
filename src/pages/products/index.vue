  <script setup>
  import { onMounted } from 'vue'
  import { $axios } from '../../utils/api'
  import { fetchFilters, fetchProducts, updateProduct } from './index'
  import { debounce } from 'lodash';


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

  //filters
  const search = ref("");
  const loading = ref(false);
  const categories = ref([]);
  const selectedCategory = ref(null);
  const selectedSubCategory = ref([]);
  const subCategories = ref([]);
  const computedSubcategories = ref([]);

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
      search.value
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

  watch([selectedCategory, selectedSubCategory], () => {
    getProducts();
  });

  watch(search, () => {
    console.log(search);

    debouncedSearch()
  })

  const handleSubcategoryChange = (value) => {
    selectedSubCategory.value = Array.isArray(value) ? value : [value];
  };

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
            <VCol cols="12" sm="4">
              <VSelect v-model="selectedCategory" label="Categoría" placeholder="Seleccionar Categoría"
                :items="categories" clearable clear-icon="ri-close-line" />
            </VCol>

            <!-- 👉 Select SubCategory -->
            <VCol cols="12" sm="4">
              <VSelect v-model="selectedSubCategory" label="Subcategoría" placeholder="Seleccionar Subcategoría"
                :items="computedSubcategories" @change="handleSubcategoryChange" chips clearable multiple
                clear-icon="ri-close-line" />
            </VCol>

            <!-- 👉 Select Stock Status -->
            <VCol cols="12" sm="4">
              <VSelect v-model="selectedStock" label="Stock" placeholder="Stock" :items="stockStatus" clearable
                clear-icon="ri-close-line" />
            </VCol>
          </VRow>
        </VCardText>

        <VDivider />

        <VCardText class="d-flex flex-wrap gap-4">
          <div class="d-flex align-center">
            <!-- 👉 Search  -->
            <VTextField v-model="search" @input="onSearchInput" placeholder="Buscar productos" density="compact"
              prepend-inner-icon="ri-search-line" clearable style="inline-size: 300px;" />
          </div>

          <VSpacer />

          <div class="d-flex gap-x-4">
            <!-- 👉 Export button -->
            <div>
              <VBtn variant="outlined" color="secondary" prepend-icon="ri-external-link-line">
                Export
              </VBtn>
            </div>

            <VBtn color="primary" prepend-icon="ri-add-line" @click="$router.push('/products/add')">
              Add Product
            </VBtn>
          </div>
        </VCardText>

        <!-- 👉 Datatable  -->
        <VDataTableServer :items-per-page="pagination.itemsPerPage" :page="pagination.page" :headers="headers"
          :items="products" :items-length="totalProduct" class="text-no-wrap rounded-0" @update:options="updateOptions">
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

          <!-- status -->
          <template #item.status="{ item }">
            <VChip v-bind="resolveStatus" size="small" />
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <IconBtn size="small">
              <VIcon icon="ri-edit-box-line" />
            </IconBtn>

            <IconBtn size="small">
              <VIcon icon="ri-more-2-fill" />

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
