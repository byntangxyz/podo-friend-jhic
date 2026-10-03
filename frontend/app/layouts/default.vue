<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-orange-50 text-stone-900">
    <!-- Header -->
    <header class="w-full border-b border-orange-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span class="text-xl font-black">P</span>
          </div>
          <span class="font-extrabold text-xl text-stone-900 tracking-tight">
            Podo<span class="text-orange-500">Friend</span>
          </span>
        </NuxtLink>

        <!-- Navigation Links / Auth State -->
        <nav class="flex items-center gap-3">
          <template v-if="authStore.isAuthenticated">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-semibold text-stone-700 hover:text-orange-600 px-3 py-1.5 rounded-xl hover:bg-orange-100/60 transition-colors"
            >
              Dashboard
            </NuxtLink>
            <span class="text-xs text-stone-400 font-medium hidden sm:inline">
              {{ authStore.user?.name }}
            </span>
            <button
              type="button"
              class="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100 hover:bg-orange-200/70 px-3 py-1.5 rounded-full transition-colors"
              @click="handleLogout"
            >
              Keluar
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/timer"
              class="text-sm font-semibold text-stone-700 hover:text-orange-600 px-3 py-1.5 rounded-xl hover:bg-orange-100/50 transition-colors"
            >
              Coba Timer
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="text-sm font-bold text-stone-700 hover:text-orange-600 px-3.5 py-1.5 rounded-xl hover:bg-orange-100/50 transition-colors"
            >
              Masuk
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full shadow-sm hover:shadow transition-all"
            >
              Daftar
            </NuxtLink>
          </template>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-xs text-stone-500 border-t border-orange-200/40">
      <div class="max-w-6xl mx-auto px-4">
        <p>© 2026 PodoFriend — Anti-Burnout Focus &amp; Study Companion.</p>
      </div>
    </footer>
  </div>
</template>
