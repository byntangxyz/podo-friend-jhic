<script setup lang="ts">
import type { MascotAnimationState } from '~/types/mascot'

interface StoryStage {
  id: number
  badge: string
  problem: {
    tag: string
    animation: MascotAnimationState
    title: string
    description: string
    pillBg: string
    borderAccent: string
  }
  solution: {
    tag: string
    animation: MascotAnimationState
    title: string
    description: string
    pillBg: string
    borderAccent: string
  }
}

const stages: StoryStage[] = [
  {
    id: 1,
    badge: 'Tahap 1',
    problem: {
      tag: 'Tantangan Belajar',
      animation: 'thinking',
      title: 'Tugas Numpuk Banyak',
      description: 'Deadline mepet di mana-mana, bingung mau mulai dari tugas yang mana dulu.',
      pillBg: 'bg-amber-100 text-amber-800 border-amber-200',
      borderAccent: 'hover:border-amber-400',
    },
    solution: {
      tag: 'Solusi Podo',
      animation: 'idle',
      title: 'Fokus 25 Menit',
      description: 'Podo bantu pecah tugas besar jadi sesi fokus terukur tanpa rasa kewalahan.',
      pillBg: 'bg-orange-100 text-orange-800 border-orange-200',
      borderAccent: 'hover:border-orange-400',
    },
  },
  {
    id: 2,
    badge: 'Tahap 2',
    problem: {
      tag: 'Kelelahan Fisik',
      animation: 'sleepy',
      title: 'Kesusahan Atur Waktu',
      description: 'Sering begadang sampai larut, tubuh lemas, dan konsentrasi cepat buyar.',
      pillBg: 'bg-blue-100 text-blue-800 border-blue-200',
      borderAccent: 'hover:border-blue-400',
    },
    solution: {
      tag: 'Solusi Podo',
      animation: 'listening',
      title: 'Jeda Rehat Teratur',
      description: 'Pengingat ramah untuk rehat sejenak, minum air, dan meregangkan otot.',
      pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      borderAccent: 'hover:border-emerald-400',
    },
  },
  {
    id: 3,
    badge: 'Tahap 3',
    problem: {
      tag: 'Titik Jenuh',
      animation: 'dizzy',
      title: 'Burnout & Overwhelmed',
      description: 'Pikiran pusing berputar, energi habis, dan kehilangan motivasi belajar.',
      pillBg: 'bg-rose-100 text-rose-800 border-rose-200',
      borderAccent: 'hover:border-rose-400',
    },
    solution: {
      tag: 'Solusi Podo',
      animation: 'excited',
      title: 'Bebas Burnout & Ceria!',
      description: 'Ditemani maskot suportif yang siap merayakan setiap progres belajarmu.',
      pillBg: 'bg-orange-100 text-orange-800 border-orange-200',
      borderAccent: 'hover:border-orange-400',
    },
  },
]

const currentIndex = ref(0)
const isPaused = ref(false)
const progress = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const currentStage = computed<StoryStage>(() => stages[currentIndex.value] ?? stages[0]!)

function nextStage() {
  currentIndex.value = (currentIndex.value + 1) % stages.length
  progress.value = 0
}

function prevStage() {
  currentIndex.value = (currentIndex.value - 1 + stages.length) % stages.length
  progress.value = 0
}

function selectStage(index: number) {
  currentIndex.value = index
  progress.value = 0
}

onMounted(() => {
  const TICK_MS = 50
  const DURATION_MS = 4500
  const STEP = (TICK_MS / DURATION_MS) * 100

  timerInterval = setInterval(() => {
    if (!isPaused.value) {
      progress.value += STEP
      if (progress.value >= 100) {
        nextStage()
      }
    }
  }, TICK_MS)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<template>
  <div
    class="w-full"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <!-- ========================================================================= -->
    <!-- DESKTOP DUAL FLANKING VIEW (lg:flex items-center justify-between)         -->
    <!-- ========================================================================= -->
    <div class="hidden lg:grid grid-cols-[290px_1fr_290px] xl:grid-cols-[320px_1fr_320px] items-center gap-6 xl:gap-8 w-full">
      <!-- LEFT CARD: PROBLEM STORY (Thinking -> Sleepy -> Dizzy) -->
      <div class="flex flex-col items-center">
        <Transition name="story-fade" mode="out-in">
          <div
            :key="currentStage.id + '-problem'"
            class="w-full bg-white/90 backdrop-blur-md rounded-3xl border-2 border-stone-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between min-h-[220px]"
            :class="currentStage.problem.borderAccent"
          >
            <!-- Card Header Badge -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[11px] font-black text-stone-600">
                {{ currentStage.badge }}
              </span>
            </div>

            <!-- Card Body: Mascot + Content -->
            <div class="flex items-start gap-3.5">
              <div class="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden">
                <AppMascot
                  :animation="currentStage.problem.animation"
                  size="custom"
                  custom-class="w-16 h-16"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-base font-black text-stone-900 leading-snug">
                  {{ currentStage.problem.title }}
                </h4>
                <p class="text-xs font-semibold text-stone-600 mt-1.5 leading-relaxed">
                  {{ currentStage.problem.description }}
                </p>
              </div>
            </div>

            <!-- Card Mini Step Indicator -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
              <div class="flex items-center gap-1.5">
                <button
                  v-for="(st, idx) in stages"
                  :key="st.id"
                  type="button"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  :class="idx === currentIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-200 hover:bg-stone-300'"
                  :aria-label="`Pilih ${st.badge}`"
                  @click="selectStage(idx)"
                />
              </div>
              <span class="text-[11px] font-bold text-stone-600">
                {{ currentIndex + 1 }}/3
              </span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- CENTER SLOT: Original Pomodoro Timer with Peeking Mascot -->
      <div class="flex justify-center w-full">
        <slot />
      </div>

      <!-- RIGHT CARD: PODO SOLUTION STORY (Idle -> Listening -> Excited) -->
      <div class="flex flex-col items-center">
        <Transition name="story-fade" mode="out-in">
          <div
            :key="currentStage.id + '-solution'"
            class="w-full bg-white/90 backdrop-blur-md rounded-3xl border-2 border-stone-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between min-h-[220px]"
            :class="currentStage.solution.borderAccent"
          >
            <!-- Card Header Badge -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[11px] font-black text-orange-600">
                Solusi Ala Podo
              </span>
            </div>

            <!-- Card Body: Mascot + Content -->
            <div class="flex items-start gap-3.5">
              <div class="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden">
                <AppMascot
                  :animation="currentStage.solution.animation"
                  size="custom"
                  custom-class="w-16 h-16"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-base font-black text-stone-900 leading-snug">
                  {{ currentStage.solution.title }}
                </h4>
                <p class="text-xs font-semibold text-stone-600 mt-1.5 leading-relaxed">
                  {{ currentStage.solution.description }}
                </p>
              </div>
            </div>

            <!-- Card Mini Step Indicator -->
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-orange-100">
              <div class="flex items-center gap-1.5">
                <button
                  v-for="(st, idx) in stages"
                  :key="st.id"
                  type="button"
                  class="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  :class="idx === currentIndex ? 'w-6 bg-orange-500' : 'w-1.5 bg-orange-200 hover:bg-orange-300'"
                  :aria-label="`Pilih ${st.badge}`"
                  @click="selectStage(idx)"
                />
              </div>
              <NuxtLink
                to="/signup"
                class="text-[11px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Coba Sekarang</span>
                <Icon name="lucide:arrow-right" class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MOBILE / TABLET VIEW (< lg: Timer on top, combined carousel below)         -->
    <!-- ========================================================================= -->
    <div class="lg:hidden flex flex-col items-center gap-6 w-full">
      <!-- Timer Slot on Top -->
      <div class="w-full flex justify-center">
        <slot />
      </div>

      <!-- Combined Story Card Carousel on Bottom -->
      <div class="w-full max-w-xl mx-auto">
        <div class="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-orange-200 p-5 sm:p-6 shadow-sm">
          <!-- Step Indicators Bar -->
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span class="text-xs font-black text-stone-800 uppercase tracking-wider">
                Kenapa Harus Podo?
              </span>
            </div>

            <!-- Interactive Stage Tabs -->
            <div class="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                v-for="(st, idx) in stages"
                :key="st.id"
                type="button"
                class="px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer"
                :class="idx === currentIndex ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'"
                @click="selectStage(idx)"
              >
                {{ st.badge }}
              </button>
            </div>
          </div>

          <!-- Carousel Stage Dual Content (Problem vs Solution) -->
          <Transition name="story-fade" mode="out-in">
            <div :key="currentStage.id" class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Problem Side -->
              <div class="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <div class="w-14 h-14 shrink-0 rounded-xl bg-white border border-amber-200 flex items-center justify-center shadow-2xs">
                  <AppMascot
                    :animation="currentStage.problem.animation"
                    size="custom"
                    custom-class="w-12 h-12"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-wider text-amber-700">
                    {{ currentStage.problem.tag }}
                  </span>
                  <h5 class="text-sm font-black text-stone-900 leading-tight mt-0.5">
                    {{ currentStage.problem.title }}
                  </h5>
                  <p class="text-xs font-medium text-stone-600 mt-1 leading-snug">
                    {{ currentStage.problem.description }}
                  </p>
                </div>
              </div>

              <!-- Solution Side -->
              <div class="p-3.5 rounded-2xl bg-orange-100/70 border border-orange-300 flex items-start gap-3">
                <div class="w-14 h-14 shrink-0 rounded-xl bg-white border border-orange-200 flex items-center justify-center shadow-2xs">
                  <AppMascot
                    :animation="currentStage.solution.animation"
                    size="custom"
                    custom-class="w-12 h-12"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-[10px] font-black uppercase tracking-wider text-orange-700">
                    {{ currentStage.solution.tag }}
                  </span>
                  <h5 class="text-sm font-black text-stone-900 leading-tight mt-0.5">
                    {{ currentStage.solution.title }}
                  </h5>
                  <p class="text-xs font-medium text-stone-600 mt-1 leading-snug">
                    {{ currentStage.solution.description }}
                  </p>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Footer Controls & Progress Bar -->
          <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
            <!-- Progress Line -->
            <div class="flex-1 bg-stone-100 h-1.5 rounded-full overflow-hidden max-w-[120px]">
              <div
                class="bg-orange-500 h-full transition-all duration-100 rounded-full"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tahap Sebelumnya"
                @click="prevStage"
              >
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tahap Selanjutnya"
                @click="nextStage"
              >
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-fade-enter-active,
.story-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.story-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.story-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
