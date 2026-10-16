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
  <div class="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-4 py-8 sm:py-12 w-full">
    <!-- Title Tagline Sesuai Gambar Referensi -->
    <div class="text-center max-w-2xl mx-auto mb-1">
      <h1 class="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-tight">
        Gini cara belajar ala <span class="text-orange-500">Podo.</span>
      </h1>
      <p class="text-sm sm:text-base font-semibold text-stone-600 mt-3 sm:mt-4">
        Teknik pomodoro membantu kamu memanejemen waktu agar terhindar dari burnout
      </p>
    </div>

    <!-- Centered Original Pomodoro Timer with Peeking Mascot Flanked by Story Carousel Cards -->
    <div class="w-full flex justify-center mt-12">
      <LandingStoryCards>
        <PomodoroTimer :peeking-mascot="true" />
      </LandingStoryCards>
    </div>
  </div>
</template>
