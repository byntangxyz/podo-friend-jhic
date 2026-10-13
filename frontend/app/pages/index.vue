<script setup lang="ts">
const authStore = useAuthStore()

// Jika pengguna sudah terautentikasi saat membuka landing page, langsung redirect ke /dashboard
if (authStore.isAuthenticated) {
  await navigateTo('/dashboard')
}

useHead({
  title: 'Anti-Burnout Focus & Study Companion',
})
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full">
    <!-- Title Tagline -->
    <div class="text-center">
      <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">
        Mulai fokus belajar dengan <span class="text-orange-500">Podo</span>
      </h1>
      <p class="text-[15px] font-semibold mt-4">
        Yuk, belajar bareng Podo! Fokus sebentar, istirahat sejenak. Podo bantu ingetin kamu buat belajar lebih teratur.
      </p>
      <AppMascot
        size="custom"
        custom-class="w-42 h-42 sm:w-42 sm:h-42"
        animation="excited"
      />
    </div>

    <!-- Centered Pomodoro Timer -->
    <div class="w-full flex justify-center">
      <PomodoroTimer />
    </div>

    <!-- Guest CTA Banner -->
    <div
      class="mt-8 w-full max-w-3xl bg-orange-100 border-2 border-orange-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm text-center sm:text-left"
    >
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Icon name="lucide:sparkles" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-black text-stone-900 leading-snug">
            Ingin hasil belajarmu tersimpan otomatis?
          </h3>
          <p class="text-xs sm:text-sm font-semibold text-orange-950 mt-1">
            Login untuk menyimpan sesi belajar, mencatat tugas, dan berinteraksi dengan AI Companion!
          </p>
        </div>
      </div>

      <NuxtLink
        to="/login"
        class="shrink-0 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
      >
        <span>Masuk Sekarang</span>
        <Icon name="lucide:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>
