<template>
  <product-form :action="EDIT" :productId="Number.parseInt(route.params.id)"></product-form>
</template>
<script setup>
import ProductForm from '@/views/pages/products/ProductForm.vue';
import { useRoute } from 'vue-router';
const route = useRoute()

</script>
