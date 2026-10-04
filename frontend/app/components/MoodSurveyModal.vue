<script setup lang="ts">
import type { MoodType } from '~/types/survey'
import type { MascotAnimationState } from '~/types/mascot'
import { STUDY_MODES, type StudyModeKey } from '~/stores/timer'

const surveyStore = useSurveyStore()
const timerStore = useTimerStore()

// State langkah survei: 1 = Mood Check-in, 2 = Pemilihan Durasi & Mode Belajar
const currentStep = ref<1 | 2>(1)

const selectedMood = ref<MoodType | null>(null)
const selectedStudyMode = ref<StudyModeKey>(timerStore.studyMode || 'normal')
const errorMessage = ref<string | null>(null)

// Inisialisasi mood jika sudah ada dari data hari ini
watch(
  () => surveyStore.todaySurvey?.mood,
  (newMood) => {
    if (newMood && ['Energetic', 'Balanced', 'Tired', 'Overwhelmed', 'Distracted'].includes(newMood)) {
      selectedMood.value = newMood as MoodType
    }
  },
  { immediate: true }
)

const modalMascotAnimation = computed<MascotAnimationState>(() => {
  if (surveyStore.isSubmitting) return 'thinking'
  if (currentStep.value === 2) {
    if (selectedStudyMode.value === 'cepat') return 'excited'
    if (selectedStudyMode.value === 'lambat') return 'listening'
    return 'idle'
  }
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

// 4 Opsi Mood Resmi Menggunakan Aset SVG dari assetDailySurvey
const moods: Array<{
  id: MoodType
  label: string
  sublabel: string
  assetSvg: string
  accentColor: string
  bgClass: string
  activeRingClass: string
}> = [
  {
    id: 'Energetic',
    label: 'Sangat Fokus',
    sublabel: 'Penuh energi & siap fokus belajar',
    assetSvg: '/surveys/dailySurveySangatfokus.svg',
    accentColor: 'text-orange-600',
    bgClass: 'bg-white hover:bg-amber-50/70 border-stone-200 hover:border-amber-300',
    activeRingClass: 'ring-3 ring-orange-500 bg-amber-50/90 border-orange-400 shadow-md',
  },
  {
    id: 'Distracted',
    label: 'Kurang Fokus',
    sublabel: 'Pikiran terbagi, butuh dampingan santai',
    assetSvg: '/surveys/dailySurveyKurangfokus.svg',
    accentColor: 'text-sky-600',
    bgClass: 'bg-white hover:bg-sky-50/70 border-stone-200 hover:border-sky-300',
    activeRingClass: 'ring-3 ring-orange-500 bg-sky-50/90 border-orange-400 shadow-md',
  },
  {
    id: 'Tired',
    label: 'Lelah',
    sublabel: 'Kurang istirahat, butuh ritme perlahan',
    assetSvg: '/surveys/dailySurveyLelah.svg',
    accentColor: 'text-orange-500',
    bgClass: 'bg-white hover:bg-orange-50/70 border-stone-200 hover:border-orange-300',
    activeRingClass: 'ring-3 ring-orange-500 bg-orange-50/90 border-orange-400 shadow-md',
  },
  {
    id: 'Overwhelmed',
    label: 'Kewalahan',
    sublabel: 'Banyak tugas, terasa menumpuk & cemas',
    assetSvg: '/surveys/dailySurveyKewalahan.svg',
    accentColor: 'text-rose-600',
    bgClass: 'bg-white hover:bg-rose-50/70 border-stone-200 hover:border-rose-300',
    activeRingClass: 'ring-3 ring-orange-500 bg-rose-50/90 border-orange-400 shadow-md',
  },
]

// 3 Mode Belajar Resmi dari assetDailySurvey pilihMode{mode}.svg
const studyModeOptions = computed(() => [
  {
    ...STUDY_MODES.cepat,
    subBadge: 'Fokus 15m • Rehat 3m',
  },
  {
    ...STUDY_MODES.normal,
    subBadge: 'Fokus 25m • Rehat 5m',
  },
  {
    ...STUDY_MODES.lambat,
    subBadge: 'Fokus 40m • Rehat 10m',
  },
])

const selectMood = (mood: MoodType) => {
  selectedMood.value = mood
  errorMessage.value = null
}

const selectStudyMode = (modeKey: StudyModeKey) => {
  selectedStudyMode.value = modeKey
  errorMessage.value = null
}

// Navigasi ke Step 2 setelah user memilih mood dan menekan "Yuk belajar!"
const goToStep2 = () => {
  if (!selectedMood.value) {
    errorMessage.value = 'Yuk, pilih salah satu kondisi perasaanmu hari ini agar Podo bisa mendampingi dengan tepat.'
    return
  }
  errorMessage.value = null
  currentStep.value = 2
}

const backToStep1 = () => {
  errorMessage.value = null
  currentStep.value = 1
}

// Submit final: simpan mood ke backend dan terapkan mode timer pomodoro
const handleSubmit = async () => {
  if (!selectedMood.value) {
    currentStep.value = 1
    errorMessage.value = 'Yuk, pilih dulu perasaanmu hari ini.'
    return
  }

  try {
    await surveyStore.submitMood(selectedMood.value)
    // Terapkan preferensi mode belajar ke timer pomodoro
    timerStore.setStudyMode(selectedStudyMode.value)
    currentStep.value = 1
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Gagal menyimpan check-in harian. Silakan coba kembali ya.'
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="bg-white rounded-3xl border-2 border-orange-300 p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative overflow-hidden my-auto transition-all"
      >
        <!-- Background Decorative Orbs -->
        <div class="absolute -top-16 -right-16 w-44 h-44 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />
        <div class="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        <!-- Top Step Indicator -->
        <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-orange-100 text-xs font-bold text-stone-500">
          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors"
              :class="currentStep === 1 ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'"
            >
              <Icon v-if="currentStep > 1" name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
              <span v-else>1</span>
            </span>
            <span :class="currentStep === 1 ? 'text-stone-900 font-extrabold' : 'text-stone-500'">Perasaan Hari Ini</span>
          </div>

          <div class="w-8 h-0.5 bg-orange-200" />

          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-colors"
              :class="currentStep === 2 ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-600'"
            >
              2
            </span>
            <span :class="currentStep === 2 ? 'text-stone-900 font-extrabold' : 'text-stone-400'">Mode Belajar</span>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 1: Check-in Perasaan / Mood          -->
        <!-- ========================================== -->
        <div v-if="currentStep === 1" class="transition-all">
          <!-- Header with Mascot -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl p-1 flex items-center justify-center shrink-0 shadow-xs">
              <AppMascot size="md" :animation="modalMascotAnimation" />
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Bagaimana perasaanmu hari ini?
              </h2>
              <p class="text-xs sm:text-sm text-stone-600 mt-0.5">
                Podo harus tau bagaimana perasaanmu hari ini.
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
          >
            <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0 text-rose-500" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Horizontal Mood Options (4 Cards with SVG Assets) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button
              v-for="m in moods"
              :key="m.id"
              type="button"
              class="flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 group cursor-pointer relative"
              :class="[
                m.bgClass,
                selectedMood === m.id
                  ? m.activeRingClass + ' scale-[1.02]'
                  : 'hover:scale-[1.02] hover:shadow-xs'
              ]"
              @click="selectMood(m.id)"
            >
              <!-- Checkmark badge when active -->
              <span
                v-if="selectedMood === m.id"
                class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs z-10"
              >
                <Icon name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
              </span>

              <!-- SVG Illustration with embedded title -->
              <div class="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform group-hover:scale-105 my-1">
                <img
                  :src="m.assetSvg"
                  :alt="m.label"
                  class="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              <!-- Descriptive helper text -->
              <p class="text-[11px] sm:text-xs text-stone-500 mt-1 line-clamp-2 leading-tight">
                {{ m.sublabel }}
              </p>
            </button>
          </div>

          <!-- Next Button (Yuk Belajar -> lanjut ke Step 2) -->
          <div class="pt-2">
            <button
              type="button"
              :disabled="!selectedMood"
              class="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              @click="goToStep2"
            >
              <span>Yuk belajar!</span>
              <Icon name="lucide:arrow-right" class="w-4 h-4 stroke-[2.5]" />
            </button>
            <p class="text-center text-[11px] text-stone-400 mt-2.5">
              Check-in emosi/mental membantu Podo mendampingimu dengan nyaman.
            </p>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 2: Berapa Lama Kamu Mau Belajar?     -->
        <!-- ========================================== -->
        <div v-else class="transition-all">
          <!-- Header with Mascot -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-2xl p-1 flex items-center justify-center shrink-0 shadow-xs">
              <AppMascot size="md" :animation="modalMascotAnimation" />
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Mau berapa lama kamu belajar?
              </h2>
              <p class="text-xs sm:text-sm text-stone-600 mt-0.5">
                Pilih ritme sesi yang paling cocok dengan energimu hari ini.
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
          >
            <Icon name="lucide:alert-circle" class="w-4 h-4 shrink-0 text-rose-500" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 3 Kartu Mode Belajar Horizontal Menggunakan SVG Resmi -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              v-for="mode in studyModeOptions"
              :key="mode.key"
              type="button"
              class="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-3xl border-2 transition-all duration-200 group cursor-pointer relative bg-white"
              :class="[
                selectedStudyMode === mode.key
                  ? 'ring-3 ring-orange-500 border-orange-400 bg-orange-50/80 shadow-md scale-[1.02]'
                  : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50/40 hover:scale-[1.01]'
              ]"
              @click="selectStudyMode(mode.key)"
            >
              <!-- Checkmark badge saat dipilih -->
              <span
                v-if="selectedStudyMode === mode.key"
                class="absolute top-3 right-3 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs z-10"
              >
                <Icon name="lucide:check" class="w-3.5 h-3.5 stroke-[3]" />
              </span>

              <!-- Ilustrasi Kartu SVG Resmi dari assetDailySurvey -->
              <div class="w-32 h-40 sm:w-36 sm:h-44 flex items-center justify-center my-1 transition-transform group-hover:scale-105">
                <img
                  :src="mode.assetSvg"
                  :alt="mode.label"
                  class="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              <!-- Durasi Badge Pill -->
              <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-orange-100/90 text-orange-900 border border-orange-200">
                <Icon name="lucide:timer" class="w-3.5 h-3.5 text-orange-600" />
                <span>{{ mode.subBadge }}</span>
              </div>
            </button>
          </div>

          <!-- Action Buttons: Kembali & Mulai Belajar -->
          <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              class="w-full sm:w-auto px-6 py-3.5 rounded-2xl border-2 border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              @click="backToStep1"
            >
              <Icon name="lucide:arrow-left" class="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              :disabled="surveyStore.isSubmitting"
              class="flex-1 w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              @click="handleSubmit"
            >
              <Icon
                v-if="surveyStore.isSubmitting"
                name="lucide:loader-2"
                class="w-5 h-5 animate-spin"
              />
              <span v-if="surveyStore.isSubmitting">Menyiapkan Sesi Belajar...</span>
              <span v-else>Mulai Sesi Belajar!</span>
            </button>
          </div>
          <p class="text-center text-[11px] text-stone-400 mt-2.5">
            Durasi timer Pomodoro akan disesuaikan otomatis dengan mode yang kamu pilih.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>
