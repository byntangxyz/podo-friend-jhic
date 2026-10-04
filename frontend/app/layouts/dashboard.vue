<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const navItems = [
  { name: 'Timer Fokus', path: '/dashboard', icon: 'lucide:timer' },
  { name: 'Statistik & Progres', path: '/gamification/stats', icon: 'lucide:flame' },
  { name: 'AI Companion', path: '/chatbot', icon: 'lucide:bot' },
  { name: 'Pengaturan', path: '/settings', icon: 'lucide:settings' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FFF7ED] text-stone-900">
    <!-- Top Bar Navigation (Figma Header Style) -->
    <header class="w-full border-b border-orange-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <!-- Logo Brand -->
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 group">
          <div class="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span class="text-xl font-black">P</span>
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold text-xl text-stone-900 tracking-tight leading-none">
              Podo<span class="text-orange-500">Friend</span>
            </span>
            <span class="text-[10px] font-bold text-orange-600/80 uppercase tracking-wider mt-0.5">
              Dashboard Belajar
            </span>
          </div>
        </NuxtLink>

        <!-- Center Nav Pills (Figma #47:1005 & #47:1009) -->
        <nav class="hidden md:flex items-center gap-2">
          <NuxtLink
            to="/dashboard"
            class="px-5 py-2 rounded-full text-sm font-extrabold transition-all flex items-center gap-2"
            :class="route.path === '/dashboard' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-700 hover:text-orange-600 hover:bg-orange-100/60'"
          >
            <Icon name="lucide:timer" class="w-4 h-4" />
            <span>Timer</span>
          </NuxtLink>

          <NuxtLink
            to="/gamification/stats"
            class="px-5 py-2 rounded-full text-sm font-extrabold transition-all flex items-center gap-2"
            :class="route.path === '/gamification/stats' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-700 hover:text-orange-600 hover:bg-orange-100/60'"
          >
            <Icon name="lucide:flame" class="w-4 h-4" />
            <span>Progress &amp; Gamifikasi</span>
          </NuxtLink>

          <NuxtLink
            to="/chatbot"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
            :class="route.path === '/chatbot' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-600 hover:text-orange-600 hover:bg-orange-100/50'"
          >
            <Icon name="lucide:bot" class="w-4 h-4" />
            <span>AI Chat</span>
          </NuxtLink>

          <NuxtLink
            to="/settings"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
            :class="route.path === '/settings' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-600 hover:text-orange-600 hover:bg-orange-100/50'"
          >
            <Icon name="lucide:settings" class="w-4 h-4" />
            <span>Pengaturan</span>
          </NuxtLink>
        </nav>

        <!-- Right Side: User Profile & Quick Actions -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/settings"
            class="hidden sm:flex items-center gap-3 pl-3 border-l border-orange-200 group hover:opacity-85 transition-opacity cursor-pointer"
            title="Buka Pengaturan Akun"
          >
            <div class="w-9 h-9 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center font-extrabold text-orange-600 text-sm group-hover:scale-105 transition-transform">
              {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-black text-stone-900 truncate max-w-[120px]">
                {{ authStore.user?.name || 'User' }}
              </span>
              <span class="text-[10px] text-stone-500 truncate max-w-[120px]">
                {{ authStore.user?.email }}
              </span>
            </div>
          </NuxtLink>

          <button
            type="button"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold text-stone-600 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
            @click="handleLogout"
          >
            <Icon name="lucide:log-out" class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 w-full max-w-[1700px]">
      <slot />
    </main>

    <!-- Bottom Navigation Bar for Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-200 px-4 py-2 flex items-center justify-around shadow-lg">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors"
        :class="route.path === item.path ? 'text-orange-600' : 'text-stone-500 hover:text-orange-500'"
      >
        <Icon :name="item.icon" class="w-5 h-5 mb-0.5" />
        <span>{{ item.name.split(' ')[0] }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
