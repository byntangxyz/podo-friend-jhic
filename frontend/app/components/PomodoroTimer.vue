<script setup lang="ts">
import type { MascotAnimationState } from '~/types/mascot'

const timerStore = useTimerStore()
const authStore = useAuthStore()

// Dialog kata-kata Podo
const podoSpeech = computed(() => {
  if (timerStore.isRunning) {
    return 'Hebat! Pertahankan fokusmu ya, jangan buka media sosial dulu!'
  }
  if (timerStore.mode === 'break') {
    return 'Waktunya istirahat sejenak! Regangkan badan dan minum air putih.'
  }
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'Timer dijeda. Siap melanjutkan fokus belajarmu lagi?'
  }
  return 'Halo aku Podo, Teman belajar kamu, Mulai!'
})

// State animasi maskot AI Companion berdasarkan aktivitas Pomodoro
const companionMascotAnimation = computed<MascotAnimationState>(() => {
  if (timerStore.isCompletedModalOpen) {
    return 'excited'
  }
  if (timerStore.mode === 'break') {
    return 'sleepy'
  }
  if (timerStore.isRunning) {
    return 'listening'
  }
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'thinking'
  }
  return 'idle'
})
</script>

<template>
  <div class="relative w-full flex flex-col items-center">
    <!-- Center Timer Stage (Figma #47:1015) -->
    <div
      class="w-full max-w-4xl flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-orange-400 p-6 sm:p-10 shadow-lg relative overflow-hidden"
    >
      <!-- Mode Switcher (Work vs Break) -->
      <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-orange-100/80 mb-6">
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2"
          :class="timerStore.mode === 'work' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600'"
          @click="timerStore.setDuration(25, 'work')"
        >
          <Icon name="lucide:target" class="w-4 h-4" />
          <span>Fokus</span>
        </button>
        <button
          type="button"
          class="px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2"
          :class="timerStore.mode === 'break' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600'"
          @click="timerStore.setDuration(5, 'break')"
        >
          <Icon name="lucide:coffee" class="w-4 h-4" />
          <span>Istirahat</span>
        </button>
      </div>

      <!-- Timer Big Numbers (Figma #44:668: 120px Inter Extra Bold) -->
      <div class="py-4 select-none text-center">
        <span
          class="text-7xl sm:text-9xl md:text-[130px] font-black text-stone-900 tracking-tight leading-none font-mono"
        >
          {{ timerStore.formattedTime }}
        </span>
      </div>

      <!-- Control Row Buttons (Figma #44:673) -->
      <div class="flex items-center justify-center gap-4 sm:gap-8 my-6">
        <!-- Reset Button (#44:674) -->
        <button
          type="button"
          aria-label="Reset Timer"
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all cursor-pointer border border-orange-300"
          @click="timerStore.reset"
        >
          <Icon name="lucide:rotate-ccw" class="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <!-- Play / Pause Button (#44:676: Orange, thick black border & shadow) -->
        <button
          type="button"
          aria-label="Mulai atau Jeda Timer"
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-orange-500 border-4 sm:border-8 border-stone-900 text-white flex items-center justify-center shadow-[0_6px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none hover:bg-orange-600 transition-all cursor-pointer group"
          @click="timerStore.isRunning ? timerStore.pause() : timerStore.start()"
        >
          <Icon
            :name="timerStore.isRunning ? 'lucide:pause' : 'lucide:play'"
            class="w-9 h-9 sm:w-11 sm:h-11 text-white group-hover:scale-110 transition-transform"
          />
        </button>

        <!-- Skip / Next Button (#44:678) -->
        <button
          type="button"
          aria-label="Lewati Sesi"
          class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all cursor-pointer border border-orange-300"
          @click="timerStore.skip"
        >
          <Icon name="lucide:fast-forward" class="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </div>

      <!-- Big 'Selesai Sesi' CTA Button (Figma #45:974) -->
      <div class="w-full max-w-sm my-2">
        <button
          type="button"
          class="w-full py-4 px-6 rounded-2xl bg-[#FFC9A8] hover:bg-[#ffb68c] active:scale-[0.98] border border-orange-300 text-[#7D614F] font-black text-xl sm:text-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 transition-all cursor-pointer"
          @click="timerStore.completeSession"
        >
          <Icon name="lucide:check-circle" class="w-6 h-6 sm:w-7 sm:h-7 text-[#7D614F]" />
          <span>Selesai Sesi</span>
        </button>
      </div>

      <!-- Mascot with Speech Bubble (Figma #44:672) -->
      <div class="mt-8 pt-6 border-t border-orange-100 w-full flex items-center justify-center gap-4 sm:gap-6">
        <div class="w-16 h-16 sm:w-24 sm:h-24 shrink-0 transition-transform hover:scale-105">
          <AppMascot
            size="custom"
            custom-class="w-16 h-16 sm:w-24 sm:h-24"
            :animation="companionMascotAnimation"
          />
        </div>

        <!-- Speech bubble with arrow -->
        <div
          class="relative bg-orange-100/80 border border-orange-200 rounded-2xl p-3.5 sm:p-4 text-stone-800 text-xs sm:text-sm font-semibold max-w-md shadow-xs"
        >
          <div
            class="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-200 border-b-8 border-b-transparent"
          />
          <p>{{ podoSpeech }}</p>
        </div>
      </div>
    </div>

    <!-- Session Completed Celebration Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="timerStore.isCompletedModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-3xl border-2 border-orange-400 p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
        >
          <div class="w-24 h-24 mx-auto flex items-center justify-center mb-4">
            <AppMascot size="lg" animation="excited" />
          </div>

          <h3 class="text-2xl font-black text-stone-900 mb-1">
            Sesi Belajar Selesai! 🎉
          </h3>
          <p class="text-sm text-stone-600 mb-6">
            Kamu berhasil menyelesaikan fokus selama
            <span class="font-extrabold text-orange-600">{{ timerStore.completedDurationMinutes }} menit</span>.
            {{ authStore.isAuthenticated ? 'Data sesi dan streak berhasil disimpan!' : 'Login untuk mencatat streak dan total waktumu!' }}
          </p>

          <div class="flex flex-col gap-3">
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/gamification/stats"
              class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow transition-all"
              @click="timerStore.closeCompletedModal"
            >
              Lihat Statistik &amp; Progres →
            </NuxtLink>
            <NuxtLink
              v-else
              to="/login"
              class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow transition-all"
              @click="timerStore.closeCompletedModal"
            >
              Masuk Sekarang →
            </NuxtLink>
            <button
              type="button"
              class="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
              @click="timerStore.closeCompletedModal"
            >
              Mulai Sesi Baru
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
