<script setup>
import { useTheme } from 'vuetify'

const { global } = useTheme()

const authProviders = [
  {
    icon: 'bxl-google',
    color: '#db4437',
    colorInDark: '#db4437',
    provider: 'google'
  }
]

const loginWithProvider = (provider) => {
  window.location.href = `/auth/${provider}`
}
</script>

<template>
  <VBtn
    v-for="link in authProviders"
    :key="link.provider"
    :icon="link.icon"
    variant="text"
    size="small"
    :color="global.name.value === 'dark' ? link.colorInDark : link.color"
    @click="loginWithProvider(link.provider)"
  />
</template>