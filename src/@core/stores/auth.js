// stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserProfile, logout, isAuthenticated } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadUser = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await getUserProfile()
      
      user.value = {
        ...response,
        initials: response.name && response.lastname
          ? `${response.name.charAt(0)}${response.lastname.charAt(0)}`.toUpperCase()
          : 'US',
        fullname: `${response.name || ''} ${response.lastname || ''}`.trim()
      }
      
      return user.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearUser = () => {
    user.value = null
  }

  const checkAuth = async () => {
    if (isAuthenticated() && !user.value) {
      await loadUser()
    }
    return isAuthenticated()
  }

  return { user, loading, error, loadUser, clearUser, checkAuth }
})