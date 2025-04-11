<script setup>
import { readonly, ref } from 'vue'
import {
  useDropZone,
  useFileDialog,
} from '@vueuse/core'

import { useImageStore } from '@/@core/stores/images'
import { $axios } from '@/utils/api.js'

const props = defineProps({
  readonly: {
    type: Boolean,
    required: true
  }
})

const dropZoneRef = ref()
const isLoading = ref(false)
const imageStore = useImageStore()
const { open, onChange } = useFileDialog({ accept: 'image/*' })

// 🚀 Subida de imagen individual al backend
const uploadImage = async (file) => {
  isLoading.value = true

  const formData = new FormData()
  formData.append('title', file.name)
  formData.append('image', file)

  return $axios.post('/products/image-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 🖱️ Selección manual con file dialog
onChange(async selectedFiles => {
  if (!selectedFiles) return

  const filesArray = Array.from(selectedFiles)

  if (filesArray.length + imageStore.images.length > 10) {
    console.log("Sólo se pueden subir un máximo de 10 imágenes");
    return
  }

  const uploadPromises = filesArray.map(file => {
    if (!file.type.startsWith('image/')) {
      console.log('Sólo es permitido el contenido de tipo imagen');
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('El tamaño del fichero no debe ser mayor de 10MB');
      return
    }

    return uploadImage(file).then(response => {
      imageStore.images.push({
        file,
        url: response.data.url,
        path: response.data.path,
      })
    })
  })

  Promise.all(uploadPromises).finally(() => {
    isLoading.value = false
  })
})

// 🖱️ Manejo de drop
const onDrop = async (DroppedFiles) => {
  if (!DroppedFiles) return

  const filesArray = Array.from(DroppedFiles)

  if (filesArray.length + imageStore.images.length > 10) {
    console.log("Sólo se pueden subir un máximo de 10 imágenes");

    return
  }

  const uploadPromises = filesArray.map(file => {
    if (!file.type.startsWith('image/')) return

    return uploadImage(file).then(response => {
      imageStore.images.push({
        file,
        url: response.data.url,
        path: response.data.path,
      })
    })
  })

  Promise.all(uploadPromises).finally(() => {
    isLoading.value = false
  })
}

useDropZone(dropZoneRef, onDrop)
</script>

<template>
  <VCardText>
    <div class="flex">
      <VProgressLinear v-if="isLoading" indeterminate color="primary" />

      <div v-else class="w-full h-auto relative">
        <div ref="dropZoneRef" class="cursor-pointer" @click="() => imageStore.images.length < 10 && !props.readonly && open()">
          <!-- Vista vacía -->
          <div v-if="props.readonly" class="w-100 d-flex justify-center text-subtitle-1">No existen imagenes del producto</div>
          <div v-if="imageStore.images.length === 0 && !props.readonly"
            class="d-flex flex-column justify-center align-center gap-y-2 pa-12 border-dashed drop-zone">
            <VAvatar variant="tonal" color="secondary" rounded>
              <VIcon icon="ri-upload-2-line" />
            </VAvatar>
            <h4 class="text-h4 text-center">
              Seleccione sus imágenes y arrástrelas aquí.
            </h4>
            <span class="text-disabled">O</span>

            <VBtn variant="outlined" v-if="!props.readonly">
              Busque sus imágenes
            </VBtn>
          </div>

          <!-- Vista con imágenes cargadas -->
          <div v-else class="d-flex justify-center align-center gap-3 pa-8 border-dashed drop-zone flex-wrap">
            <VRow class="match-height w-100">
              <template v-for="(item, index) in imageStore.images" :key="index">
                <VCol cols="12" sm="4">
                  <VCard :ripple="false" border>
                    <VCardText class="d-flex flex-column" @click.stop>
                      <VImg :src="item.url" width="200px" height="150px" class="w-100 mx-auto" />
                      <div class="mt-2 text-center">
                        <span class="clamp-text text-wrap d-block">
                          {{ item.file.name }}
                        </span>
                        <span>
                          {{ (item.file.size / 1000).toFixed(1) }} KB
                        </span>
                      </div>
                    </VCardText>
                    <VCardActions>
                      <VBtn variant="text" v-if="!props.readonly" block @click.stop="imageStore.removeImage(index)">
                        Eliminar Fichero
                      </VBtn>
                    </VCardActions>
                  </VCard>
                </VCol>
              </template>
            </VRow>
          </div>
        </div>
      </div>
    </div>
  </VCardText>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>
