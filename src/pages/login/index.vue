<template>
  <div class="auth-container">
    <div class="login-form">
      <router-link to="/" class="auth-logo d-flex align-center gap-x-3">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
      </router-link>

      <VCard flat class="login-card">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Bienvenido a <span class="text-capitalize">{{ themeConfig.app.title }}!</span> 👋🏻
          </h4>
          <p class="mb-0">Inicia sesión con tu cuenta</p>
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
              </VCol>

              <VCol cols="12">
                <VBtn class="mt-5" block type="submit" :loading="loading">
                  Iniciar sesión
                </VBtn>
              </VCol>

              <VCol cols="12" class="text-center">
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

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
import { useAuthStore } from '@/@core/stores/auth'

const { global } = useTheme()
const router = useRouter()
const authStore = useAuthStore()

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

const form = ref({
  name: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

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

    const storage = form.value.remember ? localStorage : sessionStorage
    storage.setItem('authToken', token)
    storage.setItem('user', JSON.stringify(user))

    authStore.user = {
      ...user,
      initials: user.name && user.lastname
        ? `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
        : 'US'
    }

    window.location.href = router.currentRoute.value.query.returnUrl || '/products'
  } catch (error) {
    errorMessage.value = error.message
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAuthenticated()) {
    router.replace('/products')
  }
})
</script>

<style scoped>
.auth-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
}

.login-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 1;
}

.text-primary {
  text-decoration: none;
  &.router-link-active {
    color: inherit;
  }
}

@media (max-width: 600px) {
  .login-form {
    max-width: 100%;
    padding: 1rem;
  }
}
</style>