<script setup>
import { ref } from 'vue'
import {
  useDropZone,
  useFileDialog,
} from '@vueuse/core'

import { useImageStore } from '@/stores/useImageStore'
import { useAxios } from '@/composables/useAxios' // o usa directamente axios si no tienes composable
import { giveMeASnack } from '@/composables/useSnackbar' // reemplaza por tu snack/toast real

const { $axios } = useAxios()
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
    giveMeASnack({
      message: 'Sólo se pueden subir un máximo de 10 imágenes',
      color: 'error',
      timeout: 3000,
    })
    return
  }

  const uploadPromises = filesArray.map(file => {
    if (!file.type.startsWith('image/')) {
      giveMeASnack({
        message: 'Sólo es permitido el contenido de tipo imagen',
        color: 'error',
        timeout: 3000,
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      giveMeASnack({
        message: 'El tamaño del fichero no debe ser mayor de 10MB',
        color: 'error',
        timeout: 3000,
      })
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
    giveMeASnack({
      message: 'Sólo se pueden subir un máximo de 10 imágenes',
      color: 'error',
      timeout: 3000,
    })
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
  <div class="flex">
    <div class="w-full h-auto relative">
      <div ref="dropZoneRef" class="cursor-pointer" @click="() => open()">
        <div v-if="imageStore.images.length === 0"
          class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded">
          <!-- ... mismo contenido ... -->
        </div>

        <div v-else class="d-flex justify-center align-center gap-3 pa-8 drop-zone flex-wrap">
          <VRow class="match-height w-100">
            <template v-for="(item, index) in imageStore.images" :key="index">
              <VCol cols="12" sm="4">
                <VCard :ripple="false">
                  <VCardText class="d-flex flex-column" @click.stop>
                    <VImg :src="item.url" width="200px" height="150px" class="w-100 mx-auto" />
                    <div class="mt-2">
                      <span class="clamp-text text-wrap">
                        {{ item.file.name }}
                      </span>
                      <span>
                        {{ item.file.size / 1000 }} KB
                      </span>
                    </div>
                  </VCardText>
                  <VCardActions>
                    <VBtn variant="text" block @click.stop="imageStore.removeImage(index)">
                      Remove File
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
</template>


<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>
