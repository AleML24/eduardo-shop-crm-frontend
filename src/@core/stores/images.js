import { defineStore } from 'pinia'
import {$axios} from '@/utils/api.js'

export const useImageStore = defineStore('imageStore', {
    state: () => ({
        images: [], // cada imagen debe tener: file, url, path
    }),

    actions: {
        async removeImage(index) {
            const image = this.images[index]

            // 1. Si la imagen tiene un `path`, se intenta eliminar en el backend
            if (image?.path) {
                try {
                    await $axios.post('/products/image-delete', {
                        path: image.path,
                    })
                } catch (e) {
                    console.error('❌ Error al eliminar la imagen en el servidor:', e)
                    return false
                }
            }
            // 2. Luego, se elimina del arreglo `this.images`
            this.images.splice(index, 1)

        },
          

        addImages(newImages) {
            if (this.images.length + newImages.length > 10) {
                throw new Error('Máximo 10 imágenes permitidas.')
            }
            this.images.push(...newImages)
        },

        clearImages() {
            this.images = []
        },

        setImages(images) {
            this.images = images
        }
    }
})
