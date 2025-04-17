import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])
    return route
  }
  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
    return { top: 0 }
  },
  extendRoutes: pages => [
    ...[...pages].map(route => recursiveLayouts(route)),
  ],
})

router.beforeEach((to) => {
  const publicRoutes = ['/login', '/registro', '/recuperar-contrasena']
  const authRequired = !publicRoutes.includes(to.path)
  const token = localStorage.getItem('authToken')

  // Redirigir a login si no está autenticado
  if (authRequired && !token) {
    return {
      path: '/login',
      query: { returnUrl: to.fullPath },
      meta: {
        layout: 'empty' // Indica que use el layout vacío
      }
    }
  }
  
  // Redirigir a products si ya está autenticado
  if (!authRequired && token) {
    return '/products'
  }
})

export { router }
export default function (app) {
  app.use(router)
}