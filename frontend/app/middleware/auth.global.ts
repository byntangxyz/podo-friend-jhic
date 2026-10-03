export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const publicRoutes = ['/', '/login', '/register', '/timer']
  const isPublicRoute = publicRoutes.includes(to.path)

  // 1. Pengguna tidak memiliki token dan mencoba mengakses rute terproteksi
  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  // 2. Pengguna sudah memiliki token dan mencoba mengakses rute auth (/login atau /register)
  if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
