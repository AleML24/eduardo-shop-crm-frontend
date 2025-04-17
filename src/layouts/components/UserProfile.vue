<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/@core/stores/auth'
import { updateUserProfile, logout, isAuthenticated } from '@/utils/api'
import AddUserDialog from '@/layouts/components/AddUserDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estados del componente
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isEditing = ref(false)
const isPasswordVisible = ref(false)
const showPasswordFields = ref(false)

// Datos editables del usuario
const editUser = ref({
  name: '',
  lastname: '',
  email: '',
  phone: ''
})

// Datos para cambio de contraseña
const passwordData = ref({
  password: '',
  password_confirmation: ''
})

// Acceso al usuario desde el store
const user = computed(() => authStore.user)

// Computed para verificar cambios
const hasChanges = computed(() => {
  if (!user.value) return false

  // Verificar cambios en datos básicos
  const basicInfoChanged =
    editUser.value.name !== user.value.name ||
    editUser.value.lastname !== user.value.lastname ||
    editUser.value.email !== user.value.email ||
    editUser.value.phone !== (user.value.phone || '')

  // Verificar cambios en contraseña
  const passwordChanged = showPasswordFields.value &&
    (passwordData.value.password !== '' ||
      passwordData.value.password_confirmation !== '')

  return basicInfoChanged || passwordChanged
})

// Solo permitir números en el campo de teléfono
const onlyNumbers = (event) => {
  const charCode = event.keyCode || event.which
  const charStr = String.fromCharCode(charCode)

  if (!/^\d+$/.test(charStr)) {
    event.preventDefault()
  }
}

// Iniciar edición del perfil
const startEditing = () => {
  editUser.value = {
    name: user.value.name,
    lastname: user.value.lastname,
    email: user.value.email,
    phone: user.value.phone || ''
  }
  // Resetear campos de contraseña
  passwordData.value = {
    password: '',
    password_confirmation: ''
  }
  showPasswordFields.value = false
  isEditing.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

// Cargar perfil del usuario
const loadUserProfile = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    await authStore.loadUser()
  } catch (error) {
    errorMessage.value = error.message || 'Error al cargar el perfil'
    console.error("Error loading profile:", error)
  } finally {
    loading.value = false
  }
}

// Actualizar perfil
const handleUpdateProfile = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Validación básica de campos requeridos
    if (!editUser.value.name?.trim() || !editUser.value.lastname?.trim() ||
      !editUser.value.email?.trim() || !editUser.value.phone?.trim()) {
      throw new Error('Nombre, apellido, email y celular son requeridos')
    }

    // Validación específica para celular
    if (!/^[0-9]+$/.test(editUser.value.phone)) {
      throw new Error('El celular solo debe contener números')
    }
    if (editUser.value.phone.length < 10) {
      throw new Error('El celular debe tener al menos 10 dígitos')
    }
    if (editUser.value.phone.length > 15) {
      throw new Error('El celular no puede exceder los 15 dígitos')
    }

    // Validación de campos de contraseña si están activos
    if (showPasswordFields.value) {
      if (!passwordData.value.password || !passwordData.value.password_confirmation) {
        throw new Error('Debes completar ambos campos de contraseña')
      }
      if (passwordData.value.password !== passwordData.value.password_confirmation) {
        throw new Error('Las contraseñas no coinciden')
      }
      if (passwordData.value.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }
    }

    // Preparar datos para enviar al servidor
    const payload = {
      ...editUser.value,
      ...(showPasswordFields.value && {
        password: passwordData.value.password,
        password_confirmation: passwordData.value.password_confirmation
      })
    }

    // Enviar actualización al servidor
    const updatedProfile = await updateUserProfile(payload)

    // Actualizar store con los nuevos datos
    authStore.user = {
      ...authStore.user,
      ...updatedProfile
    }

    // Mostrar mensaje de éxito y cerrar diálogo
    successMessage.value = 'Perfil actualizado correctamente'
    setTimeout(() => {
      window.location.reload()
    }, 1000)

  } catch (error) {
    errorMessage.value = error.message || 'Error al actualizar el perfil'
    console.error("Update profile error:", error)
  } finally {
    loading.value = false
  }
}

// Cerrar sesión
const handleLogout = async () => {
  try {
    loading.value = true
    await logout()
    authStore.clearUser()
    router.push('/login')
  } catch (error) {
    errorMessage.value = error.message || 'Error al cerrar sesión'
  } finally {
    loading.value = false
  }
}

const showAddUserDialog = ref(false)

// Manejar el cierre del diálogo
const handleDialogClose = () => {
  showAddUserDialog.value = false
}

// Manejar la creación exitosa de usuario
const handleUserAdded = (newUser) => {
  // Aquí puedes actualizar tu lista de usuarios o realizar otras acciones
  // Mostrar mensaje de éxito y cerrar diálogo
  successMessage.value = 'Usuario agregado correctamente'
  // showAddUserDialog.value = false
}

// Verificar autenticación al montar el componente
onMounted(() => {
  if (!isAuthenticated()) {
    router.push('/login')
  } else if (!authStore.user) {
    loadUserProfile()
  }
})
</script>

<template>
  <!-- Menú de perfil del usuario -->
  <v-menu v-if="user">
    <template v-slot:activator="{ props }">
      <v-btn color="yellow-darken-4" icon v-bind="props">
        <v-avatar>
          <span>{{ user.initials }}</span>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-text>
        <div class="mx-auto text-center">
          <v-avatar color="brown">
            <span class="text-h5">{{ user.initials }}</span>
          </v-avatar>
          <h3 class="mt-2">{{ user.name }} {{ user.lastname }}</h3>
          <p class="text-caption mt-1">
            {{ user.email }}
          </p>
          <p class="text-caption mt-1" v-if="user.phone">
            {{ user.phone }}
          </p>

          <v-divider class="my-3"></v-divider>

          <v-btn variant="text" rounded @click="startEditing" color="primary">
            Editar Perfil
          </v-btn>

          <v-divider class="my-3"></v-divider>

          <!-- Botón para abrir el diálogo de agregar usuario -->
          <v-btn @click="showAddUserDialog = true" variant="text" rounded color="primary">
            Agregar Usuario
          </v-btn>

          <v-divider class="my-3"></v-divider>

          <v-btn variant="text" rounded @click="handleLogout" :loading="loading" color="error">
            Cerrar Sesión
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>

  <!-- Diálogo de agregar usuario -->
  <AddUserDialog v-if="showAddUserDialog" @close="handleDialogClose" @user-added="handleUserAdded" />


  <!-- Diálogo de edición de perfil -->
  <v-dialog v-model="isEditing" max-width="600" persistent>
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Editar Perfil</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isEditing = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <!-- Mensajes de éxito/error -->
        <v-alert v-if="successMessage" type="success" class="mb-4">
          {{ successMessage }}
        </v-alert>

        <v-alert v-if="errorMessage" type="error" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleUpdateProfile">
          <!-- Información básica -->
          <v-text-field v-model="editUser.name" label="Nombre" required outlined class="mb-4"
            :rules="[v => !!v || 'El nombre es requerido']"></v-text-field>

          <v-text-field v-model="editUser.lastname" label="Apellido" required outlined class="mb-4"
            :rules="[v => !!v || 'El apellido es requerido']"></v-text-field>

          <v-text-field v-model="editUser.email" label="Email" type="email" required outlined class="mb-4" :rules="[
            v => !!v || 'El email es requerido',
            v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
          ]"></v-text-field>

          <v-text-field v-model="editUser.phone" label="Celular" outlined class="mb-4" required :rules="[
            v => !!v || 'El celular es requerido',
            v => /^[0-9]+$/.test(v) || 'Solo se permiten números',
            v => (v && v.length >= 10) || 'Mínimo 10 dígitos',
            v => (v && v.length <= 15) || 'Máximo 15 dígitos'
          ]" @keypress="onlyNumbers" counter="15" hint="Ingrese solo números (10-15 dígitos)"
            persistent-hint></v-text-field>

          <!-- Sección de cambio de contraseña -->
          <v-btn @click="showPasswordFields = !showPasswordFields" variant="text" color="primary" class="mb-4">
            <v-icon left>
              {{ showPasswordFields ? 'mdi-lock-open' : 'mdi-lock' }}
            </v-icon>
            {{ showPasswordFields ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña' }}
          </v-btn>

          <v-expand-transition>
            <div v-if="showPasswordFields">
              <v-text-field v-model="passwordData.password" label="Nueva contraseña"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible" outlined class="mb-4" :rules="[
                  v => !showPasswordFields || !!v || 'La contraseña es requerida',
                  v => !showPasswordFields || v?.length >= 8 || 'Mínimo 8 caracteres'
                ]"></v-text-field>

              <v-text-field v-model="passwordData.password_confirmation" label="Confirmar nueva contraseña"
                :type="isPasswordVisible ? 'text' : 'password'" outlined class="mb-4" :rules="[
                  v => !showPasswordFields || !!v || 'Debes confirmar la contraseña',
                  v => !showPasswordFields || v === passwordData.password || 'Las contraseñas no coinciden'
                ]"></v-text-field>
            </div>
          </v-expand-transition>

          <!-- Botones de acción -->
          <div class="d-flex justify-end">
            <v-btn type="submit" color="primary" :loading="loading" class="mr-2" :disabled="!hasChanges || loading">
              Guardar Cambios
            </v-btn>

            <v-btn @click="isEditing = false" :disabled="loading">
              Cancelar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>