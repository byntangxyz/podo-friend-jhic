<script setup lang="ts">
import type { MoodType } from '~/types/survey'
import type { MascotAnimationState } from '~/types/mascot'

const surveyStore = useSurveyStore()

const modalMascotAnimation = computed<MascotAnimationState>(() => {
  if (surveyStore.isSubmitting) return 'thinking'
  switch (selectedMood.value) {
    case 'Energetic':
      return 'excited'
    case 'Tired':
    case 'Overwhelmed':
      return 'sleepy'
    case 'Distracted':
      return 'searching'
    case 'Balanced':
      return 'listening'
    default:
      return 'idle'
  }
})

const moods: Array<{
  id: MoodType
  label: string
  sublabel: string
  icon: string
  colorClass: string
  bgClass: string
  activeRingClass: string
}> = [
  {
    id: 'Energetic',
    label: 'Energetic',
    sublabel: 'Penuh energi & siap fokus!',
    icon: 'lucide:zap',
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200',
    activeRingClass: 'ring-2 ring-amber-500 bg-amber-100/90 border-amber-400',
  },
  {
    id: 'Balanced',
    label: 'Balanced',
    sublabel: 'Rileks, stabil & konsisten',
    icon: 'lucide:scale',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200',
    activeRingClass: 'ring-2 ring-emerald-500 bg-emerald-100/90 border-emerald-400',
  },
  {
    id: 'Tired',
    label: 'Tired',
    sublabel: 'Kurang istirahat, butuh ritme santai',
    icon: 'lucide:battery-low',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50/80 hover:bg-orange-100/70 border-orange-200',
    activeRingClass: 'ring-2 ring-orange-500 bg-orange-100/90 border-orange-400',
  },
  {
    id: 'Overwhelmed',
    label: 'Overwhelmed',
    sublabel: 'Beban pikiran berat, mudah cemas',
    icon: 'lucide:cloud-lightning',
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-200',
    activeRingClass: 'ring-2 ring-rose-500 bg-rose-100/90 border-rose-400',
  },
  {
    id: 'Distracted',
    label: 'Distracted',
    sublabel: 'Sulit konsentrasi, sering terdistraksi',
    icon: 'lucide:compass',
    colorClass: 'text-sky-500',
    bgClass: 'bg-sky-50/80 hover:bg-sky-100/70 border-sky-200',
    activeRingClass: 'ring-2 ring-sky-500 bg-sky-100/90 border-sky-400',
  },
]

const selectedMood = ref<MoodType | null>(null)
const errorMessage = ref<string | null>(null)

const selectMood = (mood: MoodType) => {
  selectedMood.value = mood
  errorMessage.value = null
}

const handleSubmit = async () => {
  if (!selectedMood.value) {
    errorMessage.value = 'Silakan pilih salah satu mood sebelum melanjutkan.'
    return
  }

  try {
    await surveyStore.submitMood(selectedMood.value)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Gagal menyimpan mood. Silakan coba kembali.'
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="surveyStore.showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="bg-white rounded-3xl border-2 border-orange-300 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        <!-- Top decorative banner -->
        <div class="absolute -top-16 -right-16 w-36 h-36 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />
        <div class="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        <!-- Header with Mascot -->
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 p-1 flex items-center justify-center shrink-0 border border-orange-200">
            <AppMascot size="sm" :animation="modalMascotAnimation" />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-1">
              <span>Mood Check-in Harian</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Bagaimana perasaan belajarmu?
            </h2>
            <p class="text-xs sm:text-sm text-stone-600">
              Podo akan menyesuaikan ritme belajar dan respon AI sesuai kondisimu.
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
        >
          <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 5 Mood Option Buttons (STRICTLY SVG ICONS, NO SYSTEM EMOJI) -->
        <div class="space-y-2.5 mb-6">
          <button
            v-for="m in moods"
            :key="m.id"
            type="button"
            class="w-full flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all group"
            :class="[
              m.bgClass,
              selectedMood === m.id ? m.activeRingClass : 'shadow-xs'
            ]"
            @click="selectMood(m.id)"
          >
            <div
              class="w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-stone-200/60 transition-transform group-hover:scale-105"
            >
              <Icon :name="m.icon" :class="['w-6 h-6', m.colorClass]" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-extrabold text-stone-900">{{ m.label }}</span>
                <span
                  v-if="selectedMood === m.id"
                  class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center"
                >
                  <Icon name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
              <p class="text-xs text-stone-600 truncate">{{ m.sublabel }}</p>
            </div>
          </button>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="button"
            :disabled="!selectedMood || surveyStore.isSubmitting"
            class="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            @click="handleSubmit"
          >
            <Icon
              v-if="surveyStore.isSubmitting"
              name="lucide:loader-2"
              class="w-5 h-5 animate-spin"
            />
            <span v-if="surveyStore.isSubmitting">Menyimpan Mood...</span>
            <span v-else>Mulai Belajar Bersama Podo</span>
          </button>
          <p class="text-center text-[11px] text-stone-400 mt-2">
            Survei ini wajib diisi satu kali per hari untuk kalibrasi sistem Podo.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
