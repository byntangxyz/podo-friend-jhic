<script setup lang="ts">
useHead({
  title: 'Dashboard Belajar',
})

const authStore = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
    <!-- Welcome Header Card -->
    <BaseCard variant="white" padding="lg">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <!-- Mascot -->
        <div class="p-3 bg-orange-100 rounded-3xl shrink-0">
          <AppMascot size="lg" />
        </div>

        <!-- User Information -->
        <div class="flex-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Autentikasi Aktif (Phase 1)</span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-black text-stone-900">
            Halo, <span class="text-orange-500">{{ authStore.user?.name || 'Teman Belajar' }}</span>!
          </h1>
          <p class="text-sm text-stone-600 mt-1">
            Akun terhubung: <span class="font-semibold text-stone-800">{{ authStore.user?.email }}</span>
          </p>

          <div class="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
            <BaseButton
              variant="outline"
              size="sm"
              :loading="isLoggingOut"
              @click="handleLogout"
            >
              Keluar (Logout)
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Phase 1 Success Summary -->
    <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      <BaseCard variant="cream" padding="md">
        <h2 class="text-base font-extrabold text-stone-900 mb-2 flex items-center gap-2">
          <span>🛡️</span>
          <span>Status Keamanan &amp; Sesi</span>
        </h2>
        <p class="text-xs text-stone-600 leading-relaxed mb-3">
          State autentikasi tersimpan aman di Pinia store dengan token Sanctum Bearer yang siap digunakan untuk seluruh request API di fase berikutnya.
        </p>
        <div class="p-2.5 rounded-xl bg-white/80 border border-orange-200 text-xs font-mono text-stone-500 break-all">
          Token: {{ authStore.token ? authStore.token.substring(0, 24) + '...' : 'Tidak ada token' }}
        </div>
      </BaseCard>

      <BaseCard variant="cream" padding="md">
        <h2 class="text-base font-extrabold text-stone-900 mb-2 flex items-center gap-2">
          <span>🚀</span>
          <span>Persiapan Phase Selanjutnya</span>
        </h2>
        <p class="text-xs text-stone-600 leading-relaxed">
          Fondasi sistem siap untuk pengembangan modul <strong>Mood Survey</strong> harian, <strong>Pomodoro Timer</strong> presisi, dan integrasi <strong>LangChain AI Companion</strong>.
        </p>
      </BaseCard>
    </div>
  </div>
</template>
