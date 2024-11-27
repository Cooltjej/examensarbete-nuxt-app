export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  const allowedRoutes = ['/', '/register']
  if (!authStore.user && !allowedRoutes.includes(to.path)) {
    return navigateTo('/')
  }
})