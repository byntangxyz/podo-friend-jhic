<script setup lang="ts">
useHead({
  title: 'Anti-Burnout Focus & Study Companion',
})

const authStore = useAuthStore()
</script>

<template>
  <div class="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:py-16">
    <div class="max-w-4xl mx-auto w-full text-center flex flex-col items-center">
      <!-- Mascot Badge / Animation -->
      <div class="mb-6 relative">
        <div class="p-4 bg-orange-100/70 rounded-full border-2 border-orange-300 shadow-inner">
          <AppMascot size="lg" />
        </div>
        <span class="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-bounce">
          Hai! 👋
        </span>
      </div>

      <!-- Hero Header -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-4 tracking-wide uppercase">
        <span>✨ Teman Belajar &amp; Fokus Anti-Burnout</span>
      </div>

      <h1 class="text-3xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-tight max-w-3xl">
        Anti-Burnout Focus &amp; <span class="text-orange-500">Study Companion</span>
      </h1>

      <p class="mt-5 text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
        Tingkatkan produktivitas tanpa rasa cemas. PodoFriend memadukan teknik Pomodoro dengan pendamping AI yang memahami kondisi emosionalmu agar belajar tetap menyenangkan.
      </p>

      <!-- CTA Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/dashboard">
            <BaseButton size="lg" variant="primary">
              Buka Dashboard Belajar
              <span class="ml-2">→</span>
            </BaseButton>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/register" class="w-full sm:w-auto">
            <BaseButton size="lg" variant="primary" block>
              Mulai Sekarang (Gratis)
              <span class="ml-2">→</span>
            </BaseButton>
          </NuxtLink>
          <NuxtLink to="/login" class="w-full sm:w-auto">
            <BaseButton size="lg" variant="outline" block>
              Sudah Punya Akun? Masuk
            </BaseButton>
          </NuxtLink>
        </template>
      </div>

      <!-- Feature Highlights -->
      <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left w-full">
        <BaseCard variant="white" padding="md" class="hover:-translate-y-1 transition-transform">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            ⏱️
          </div>
          <h2 class="font-extrabold text-stone-900 text-base mb-1">
            Timer Fleksibel
          </h2>
          <p class="text-xs text-stone-600 leading-normal">
            Sesi fokus terstruktur dengan durasi adaptif untuk menjaga ritme kerja tanpa kelelahan mental.
          </p>
        </BaseCard>

        <BaseCard variant="white" padding="md" class="hover:-translate-y-1 transition-transform">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            😊
          </div>
          <h2 class="font-extrabold text-stone-900 text-base mb-1">
            Mood Check-in
          </h2>
          <p class="text-xs text-stone-600 leading-normal">
            Pantau energi dan suasana hatimu sebelum dan sesudah sesi untuk mencegah gejala burnout dini.
          </p>
        </BaseCard>

        <BaseCard variant="white" padding="md" class="hover:-translate-y-1 transition-transform">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
            🤖
          </div>
          <h2 class="font-extrabold text-stone-900 text-base mb-1">
            AI Companion
          </h2>
          <p class="text-xs text-stone-600 leading-normal">
            Teman ngobrol AI yang ramah dan siap mendengarkan serta memberikan motivasi positif setiap waktu.
          </p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
