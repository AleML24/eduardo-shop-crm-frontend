<template>
  <v-card class="pa-4">
    <v-card-title class="text-center py-3 text-h4">Confirmar eliminación</v-card-title>
    <v-card-text class="text-body-1">
      ¿Está seguro que desea eliminar este producto? Esta acción será <strong>irreversible</strong>.
    </v-card-text>
    <v-card-actions class="d-flex justify-end gap-1">
      <v-btn variant="outlined" @click="emit('cancel')">cancelar</v-btn>
      <v-btn color="error" variant="elevated" @click="emit('confirm')">Eliminar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>

const emit = defineEmits(['cancel', 'confirm'])
</script>
