<script setup>
import ProductForm from '@/views/pages/products/ProductForm.vue';
import { useRoute } from 'vue-router';
import { PRODUCT_ACTIONS } from '@/constants/products';

const route = useRoute();
</script>

<template>
  <ProductForm 
    :action="PRODUCT_ACTIONS.SHOW" 
    :productId="Number(route.params.id)" 
  />
</template>