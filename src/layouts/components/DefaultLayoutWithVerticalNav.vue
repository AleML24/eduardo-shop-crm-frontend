<script setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'


// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

const showSnackbar = ref(false)

const snackbarOptions = ref({
  message: '',
  variant: null,
  color: 'primary',
  timeout: 2000,
  location: 'top end',
  transition: 'fade-transition',
  showAction: false,
  actionText: 'Cerrar',
})

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION

const throwSnack = options => {
  snackbarOptions.value = {
    message: options.message || '',
    variant: options.variant || 'flat',
    color: options.color || 'primary',
    timeout: options.timeout || 2000,
    location: options.location || 'top end',
    transition: options.transition || 'fade-transition',
    showAction: options.showAction || false,
    actionText: options.actionText || 'Cerrar',
  }

  nextTick(() => {
    showSnackbar.value = true
  })
}

// TODO listen to events
// $echo.channel('channel_dejavu')
//   .listen('ForceLogoutEvent', data => {
//     console.log('event handled', data)
//   })

provide('Snackbar:giveMeASnack', throwSnack)
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn id="vertical-nav-toggle-btn" class="ms-n2 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig" />
        <UserProfile />
      </div>
    </template>

    <AppLoadingIndicator ref="refLoadingIndicator" />
    <VSnackbar v-model="showSnackbar" :variant="snackbarOptions.variant" :color="snackbarOptions.color"
      :timeout="snackbarOptions.timeout" :location="snackbarOptions.location" :transition="snackbarOptions.transition">
      {{ snackbarOptions.message }}
      <template v-if="snackbarOptions.showAction" #actions>
        <VBtn :color="snackbarOptions.color" @click="snackbarOptions.value.show = false">
          {{ snackbarOptions.actionText }}
        </VBtn>
      </template>
    </VSnackbar>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
