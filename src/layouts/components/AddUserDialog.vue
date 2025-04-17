<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/@core/stores/auth'
import { register } from '@/utils/api'

const authStore = useAuthStore()

// Props y emits
const emit = defineEmits(['close', 'user-added'])

// Estados del componente
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isPasswordVisible = ref(false)
const dialog = ref(true)

// Datos del nuevo usuario
const newUser = ref({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
})

// Computed para validar si el formulario está completo
const isFormValid = computed(() => {
    return (
        newUser.value.name &&
        newUser.value.lastname &&
        newUser.value.email &&
        newUser.value.phone &&
        newUser.value.password &&
        newUser.value.password_confirmation &&
        newUser.value.password === newUser.value.password_confirmation &&
        newUser.value.password.length >= 8
    )
})

// Solo permitir números en el campo de teléfono
const onlyNumbers = (event) => {
    const charCode = event.keyCode || event.which
    const charStr = String.fromCharCode(charCode)

    if (!/^\d+$/.test(charStr)) {
        event.preventDefault()
    }
}

// Registrar nuevo usuario
const handleRegister = async () => {
    try {
        loading.value = true
        errorMessage.value = ''
        successMessage.value = ''

        // Validaciones adicionales
        if (newUser.value.phone.length < 10 || newUser.value.phone.length > 15) {
            throw new Error('El teléfono debe tener entre 10 y 15 dígitos')
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.value.email)) {
            throw new Error('Por favor ingrese un email válido')
        }

        // Registrar usuario
        const response = await register(newUser.value)

        // Emitir evento de usuario agregado
        emit('user-added', response.user)

        successMessage.value = 'Usuario registrado con éxito'
        setTimeout(() => {
            window.location.reload()
        }, 1000)

    } catch (error) {
        errorMessage.value = error.message || 'Error al registrar el usuario'
        console.error("Registration error:", error)
    } finally {
        loading.value = false
    }
}

// Cerrar diálogo
const closeDialog = () => {
    dialog.value = false
    emit('close')
}
</script>

<template>
    <v-dialog v-model="dialog" max-width="600" persistent>
        <v-card>
            <v-toolbar color="primary" dark>
                <v-toolbar-title>Agregar Nuevo Usuario</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="closeDialog">
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

                <v-form @submit.prevent="handleRegister">
                    <!-- Información básica -->
                    <v-text-field v-model="newUser.name" label="Nombre" required outlined class="mb-4"
                        :rules="[v => !!v || 'El nombre es requerido']"></v-text-field>

                    <v-text-field v-model="newUser.lastname" label="Apellido" required outlined class="mb-4"
                        :rules="[v => !!v || 'El apellido es requerido']"></v-text-field>

                    <v-text-field v-model="newUser.email" label="Email" type="email" required outlined class="mb-4"
                        :rules="[
                            v => !!v || 'El email es requerido',
                            v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
                        ]"></v-text-field>

                    <v-text-field v-model="newUser.phone" label="Celular" outlined class="mb-4" required :rules="[
                        v => !!v || 'El celular es requerido',
                        v => /^[0-9]+$/.test(v) || 'Solo se permiten números',
                        v => (v && v.length >= 10) || 'Mínimo 10 dígitos',
                        v => (v && v.length <= 15) || 'Máximo 15 dígitos'
                    ]" @keypress="onlyNumbers" counter="15" hint="Ingrese solo números (10-15 dígitos)"
                        persistent-hint></v-text-field>

                    <!-- Campos de contraseña -->
                    <v-text-field v-model="newUser.password" label="Contraseña"
                        :type="isPasswordVisible ? 'text' : 'password'"
                        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="isPasswordVisible = !isPasswordVisible" outlined class="mb-4" :rules="[
                            v => !!v || 'La contraseña es requerida',
                            v => v?.length >= 8 || 'Mínimo 8 caracteres'
                        ]"></v-text-field>

                    <v-text-field v-model="newUser.password_confirmation" label="Confirmar contraseña"
                        :type="isPasswordVisible ? 'text' : 'password'" outlined class="mb-4" :rules="[
                            v => !!v || 'Debes confirmar la contraseña',
                            v => v === newUser.password || 'Las contraseñas no coinciden'
                        ]"></v-text-field>

                    <!-- Botones de acción -->
                    <div class="d-flex justify-end">
                        <v-btn type="submit" color="primary" :loading="loading" class="mr-2"
                            :disabled="!isFormValid || loading">
                            Registrar Usuario
                        </v-btn>

                        <v-btn @click="closeDialog" :disabled="loading">
                            Cancelar
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>