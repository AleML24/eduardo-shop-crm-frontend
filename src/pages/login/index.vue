<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { login, isAuthenticated, getUserProfile } from '@/utils/api'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import tree1 from '@images/misc/tree1.png'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/mask-v2-dark.png'
import authV2MaskLight from '@images/pages/mask-v2-light.png'
// import dailyLifeImage from '@/assets/images/Daily Life in Ancient Greece_ What it Was Like to Live in Athens and Sparta.png'
import { useAuthStore } from '@/@core/stores/auth'

const { global } = useTheme()
const router = useRouter()
const authStore = useAuthStore() 

// Configuración de imágenes temáticas
const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

// Estado del formulario
const form = ref({
  name: '',
  password: '',
  remember: false,
})

// Estado del componente
const isPasswordVisible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Manejo del login actualizado
const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    if (!form.value.name || !form.value.password) {
      throw new Error('Por favor completa todos los campos')
    }

    const { token, user } = await login({
      name: form.value.name,
      password: form.value.password
    })

    // Almacenar token y datos de usuario
    const storage = form.value.remember ? localStorage : sessionStorage
    storage.setItem('authToken', token)
    storage.setItem('user', JSON.stringify(user))

    // Actualizar el store de autenticación
    authStore.user = {
      ...user,
      initials: user.name && user.lastname
        ? `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
        : 'US'
    }

    // Redirigir forzando recarga para asegurar que todos los componentes se actualicen
    window.location.href = router.currentRoute.value.query.returnUrl || '/products'

  } catch (error) {
    errorMessage.value = error.message
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

// Verificar autenticación al cargar el componente
onMounted(() => {
  if (isAuthenticated()) {
    router.replace('/products')
  }
})
</script>

<template>
  <router-link to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </router-link>

  <VRow no-gutters class="auth-wrapper">
    <VCol md="8" class="d-none d-md-flex position-relative">
      <div class="d-flex align-center justify-end w-100 h-100 pa-10" :class="$vuetify.locale.isRtl ? 'pe-10' : 'pe-0'">
        <VImg max-width="797" :src="authThemeImg" class="auth-illustration" />
      </div>

      <img class="auth-footer-mask" height="360" :src="authThemeMask">
      <VImg :src="tree1" alt="tree image" height="190" width="90" class="auth-footer-tree" />
    </VCol>

    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenido a <span class="text-capitalize">{{ themeConfig.app.title }}!</span> 👋🏻
          </h4>
          <p class="mb-0">
            Inicia sesión con tu cuenta
          </p>
        </VCardText>

        <VCardText>
          <VAlert v-if="errorMessage" type="error" class="mb-4">
            {{ errorMessage }}
          </VAlert>

          <VForm @submit.prevent="handleLogin">
            <VRow>
              <VCol cols="12">
                <VTextField 
                  v-model="form.name" 
                  autofocus 
                  label="Nombre de usuario"
                  placeholder="Ingresa tu nombre de usuario" 
                  :rules="[v => !!v || 'El nombre es requerido']" 
                  required 
                />
              </VCol>

              <VCol cols="12">
                <VTextField 
                  v-model="form.password" 
                  label="Contraseña" 
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[v => !!v || 'La contraseña es requerida']" 
                  required 
                />

                <!-- <div class="d-flex align-center flex-wrap justify-space-between my-5 gap-2">
                  <VCheckbox v-model="form.remember" label="Recordar sesión" />
                  <router-link class="text-primary" to="/recuperar-contrasena">
                    ¿Olvidaste tu contraseña?
                  </router-link>
                </div> -->

                <VBtn class="mt-5" block type="submit" :loading="loading">
                  Iniciar sesión
                </VBtn>
              </VCol>

              <!-- <VCol cols="12" class="text-center text-base">
                <span>¿No tienes una cuenta?</span>
                <router-link class="text-primary d-inline-block ml-1" to="/registro">
                  Regístrate
                </router-link>
              </VCol> -->

              <!-- <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-2 text-high-emphasis">o</span>
                <VDivider />
              </VCol> -->

              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.auth-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 1;
}

.text-primary {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>