<script setup>
import { onMounted } from 'vue'
import { $axios } from '../../utils/api'
import { fetchFilters, fetchProducts } from './index'


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
  { title: "Habilidad", text: "Habilidad", value: "ability" },
  { title: "Color", text: "Color", value: "color" },
  { title: 'Actions', key: 'actions', sortable: false, },
]);
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

//filters
const search = ref("");
const categories = ref([]);
const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const subCategories = ref([])
const computedSubcategories = ref([])

//functions
const getProducts = async () => {
  const response = await fetchProducts(
    pagination.value.page,
    pagination.value.itemsPerPage,
    pagination.value.sortBy,
    pagination.value.orderBy,
    selectedCategory.value,
    selectedSubCategory.value
  )

  if (!response.success) {
    alert(response.message)
    return
  }

  products.value = response.data
  totalProduct.value = response.meta.total
}

const getFilters = async () => {
  console.log('hola');

  const response = await fetchFilters()

  if (!response.success) {
    alert(response.message)
    return
  }

  categories.value = response.data.map((item) => {
    return {
      title: item.name,
      value: item.id
    }
  })
  subCategories.value = response.data.map(item => {
    const subCategorias = item.subcategories.map((sub) => {
      return {
        title: sub.name,
        value: sub.id,
      }
    })
    return {
      category_id: item.id,
      subcategories: subCategorias
    }
  })

  subCategories.value.forEach(element => {
    computedSubcategories.value.push(...element.subcategories)
  })
  console.log(computedSubcategories.value);

}

watch([selectedCategory, selectedSubCategory], () => {
  getProducts();
});

watch(selectedCategory, () => {
  computedSubcategories.value = []
  subCategories.value.forEach(element => {
    if (element.category_id === selectedCategory.value) {
      computedSubcategories.value.push(...element.subcategories)
    }
  })
})

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
              :items="computedSubcategories" chips clearable clear-icon="ri-close-line" />
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
          <VTextField v-model="searchQuery" placeholder="Search Product" style="inline-size: 200px;" density="compact"
            class="me-3" prepend-inner-icon="ri-search-line" />
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

        <!-- stock -->
        <template #item.stock="{ item }">
          <VSwitch :model-value="item.stock" />
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
