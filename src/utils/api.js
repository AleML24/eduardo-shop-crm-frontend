import axios from 'axios'

export const $axios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// Interceptor para añadir el token a las peticiones
$axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// En tu interceptor de respuesta (corrige el router)
$axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    // Usa window.location para asegurar la recarga
    window.location.href = '/login'
  }
  return Promise.reject(error)
})

/**
 * Realiza el login del usuario
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.name - Nombre de usuario
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const login = async ({ name, password }) => {
  try {
    const response = await $axios.post('/login', { name, password })
    
    if (!response.data.data?.token) {
      throw new Error('No se recibió el token de autenticación')
    }

    // Almacenar token y datos del usuario
    localStorage.setItem('authToken', response.data.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.data.user))

    return response.data.data
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Credenciales incorrectas')
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's first name
 * @param {string} userData.lastname - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.phone - User's phone number
 * @param {string} userData.password - Password
 * @param {string} userData.password_confirmation - Password confirmation
 * @returns {Promise<Object>} Response containing token and user data
 */
export const register = async (userData) => {
  try {
    const response = await $axios.post('/register', {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      password_confirmation: userData.password_confirmation
    });

    // Check if response contains the expected data
    if (!response.data.data?.token || !response.data.data?.user) {
      throw new Error('Invalid response format from server');
    }

    // Automatically log in the user after registration
    localStorage.setItem('authToken', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));

    return {
      token: response.data.data.token,
      user: response.data.data.user
    };

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors (422 status)
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors || {};
      // Format validation errors into a single string
      const errorMessages = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');
      
      throw new Error(errorMessages || 'Validation failed');
    }

    // Handle other types of errors
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Registration failed. Please try again.'
    );
  }
};

/**
 * Cierra la sesión del usuario
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await $axios.post('/logout')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserProfile = async () => {
  try {
    const response = await $axios.get('/user')
    console.log("getUserProfile activado:", response.data.data);
    
    return response.data.data
    
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener el perfil')
  }
}

/**
 * Actualiza el perfil del usuario
 * @param {Object} userData - Datos del usuario a actualizar
 * @returns {Promise<Object>} Datos actualizados del usuario
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await $axios.put('/user/profile', userData)
    // Actualizar datos del usuario en localStorage si es necesario
    if (response.data.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
    }
    console.log(response.data.data);
    
    return response.data.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar el perfil')
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken')
}

/**
 * Obtiene los datos del usuario almacenados
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

/**
 * Obtiene el token almacenado
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken')
}