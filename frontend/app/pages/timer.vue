<script setup lang="ts">
useHead({
  title: 'Pomodoro Timer - Coba Gratis',
  meta: [
    {
      name: 'description',
      content: 'Fokus belajar dengan Pomodoro Timer interaktif bersama Podo. Coba langsung tanpa login!',
    },
  ],
})
</script>

<template>
  <div class="py-6 sm:py-10 px-4">
    <div class="max-w-4xl mx-auto text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider mb-3">
        <Icon name="lucide:sparkles" class="w-4 h-4" />
        <span>Guest Mode • Pomodoro Timer</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
        Fokus Belajar Bersama <span class="text-orange-500">Podo</span>
      </h1>
      <p class="text-sm sm:text-base text-stone-600 mt-2 max-w-xl mx-auto">
        Gunakan timer 25 menit untuk menjaga konsentrasimu. Masuk dengan akun PodoFriend untuk menyimpan riwayat sesi dan menaikkan streak belajarmu!
      </p>
    </div>

    <!-- Pomodoro Timer Component in Guest Mode -->
    <PomodoroTimer />
  </div>
</template>
