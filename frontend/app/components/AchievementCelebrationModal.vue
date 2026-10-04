<script setup lang="ts">
import { ACHIEVEMENT_DEFINITIONS, type AchievementDefinition } from '~/types/achievement'

const timerStore = useTimerStore()

const unlockedList = computed<AchievementDefinition[]>(() => {
  return timerStore.newlyUnlockedAchievements
    .map(code => ACHIEVEMENT_DEFINITIONS[code])
    .filter((ach): ach is AchievementDefinition => Boolean(ach))
})

const handleClose = () => {
  timerStore.closeAchievementCelebration()
}

// Close on Escape key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && timerStore.isAchievementCelebrationOpen) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="timerStore.isAchievementCelebrationOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- Modal Card -->
        <div
          class="relative w-full max-w-lg bg-gradient-to-b from-orange-50 via-white to-orange-100/50 rounded-3xl border-2 border-orange-300 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden animate-fade-in"
        >
          <!-- Decorative Glow & Sparks in Background -->
          <div class="absolute -top-12 -left-12 w-44 h-44 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
          <div class="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <!-- Close Icon in Top Right -->
          <button
            type="button"
            class="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-orange-100 transition-colors cursor-pointer"
            title="Tutup"
            @click="handleClose"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>

          <!-- Excited Mascot Animation -->
          <div class="relative mb-3 flex items-center justify-center">
            <div class="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <AppMascot size="lg" animation="excited" />
            </div>
            <!-- Sparkle Accents -->
            <div class="absolute -top-1 -right-2 text-amber-500 animate-bounce">
              <Icon name="lucide:sparkles" class="w-6 h-6 fill-amber-400" />
            </div>
            <div class="absolute bottom-2 -left-2 text-orange-500 animate-pulse">
              <Icon name="lucide:flame" class="w-5 h-5 fill-orange-400" />
            </div>
          </div>

          <!-- Header Titles -->
          <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider mb-2 border border-orange-300">
            <Icon name="lucide:award" class="w-4 h-4" />
            <span>Pencapaian Baru Terbuka!</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Luar Biasa, Kamu Hebat!
          </h2>
          <p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-sm">
            Dedikasi dan konsistensi belajarmu membuahkan hasil. Podo bangga banget sama kamu!
          </p>

          <!-- Unlocked Badges List -->
          <div class="w-full my-5 flex flex-col gap-3">
            <div
              v-for="ach in unlockedList"
              :key="ach.code"
              class="w-full p-4 rounded-2xl bg-white border-2 border-orange-300 shadow-sm flex items-center gap-4 text-left transition-transform hover:scale-[1.02]"
            >
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-md">
                <Icon :name="ach.icon" class="w-7 h-7" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <h3 class="text-base font-black text-stone-900 truncate">
                    {{ ach.title }}
                  </h3>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                    Unlocked ✓
                  </span>
                </div>
                <p class="text-xs text-stone-600 mt-0.5">
                  {{ ach.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            class="w-full sm:w-auto px-8 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            @click="handleClose"
          >
            <span>Keren, Lanjut Belajar!</span>
            <Icon name="lucide:arrow-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
