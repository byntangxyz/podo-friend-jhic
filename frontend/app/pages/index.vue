<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Anti-Burnout Focus & Study Companion',
})

const authStore = useAuthStore()
const surveyStore = useSurveyStore()
const gamificationStore = useGamificationStore()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      surveyStore.fetchTodaySurvey(),
      gamificationStore.fetchStats(),
    ])
  }
})

const moodBadgeInfo = computed(() => {
  const m = surveyStore.todaySurvey?.mood
  switch (m) {
    case 'Energetic':
      return {
        icon: 'lucide:zap',
        color: 'text-amber-600 bg-amber-100 border-amber-300',
      }
    case 'Balanced':
      return {
        icon: 'lucide:scale',
        color: 'text-emerald-600 bg-emerald-100 border-emerald-300',
      }
    case 'Tired':
      return {
        icon: 'lucide:battery-low',
        color: 'text-orange-600 bg-orange-100 border-orange-300',
      }
    case 'Overwhelmed':
      return {
        icon: 'lucide:cloud-lightning',
        color: 'text-rose-600 bg-rose-100 border-rose-300',
      }
    case 'Distracted':
      return {
        icon: 'lucide:compass',
        color: 'text-sky-600 bg-sky-100 border-sky-300',
      }
    default:
      return null
  }
})
</script>

<template>
  <NuxtLayout :name="authStore.isAuthenticated ? 'dashboard' : 'default'">
    <!-- TAMPILAN JIKA LOGGED IN (Sudah Login) -->
    <div
      v-if="authStore.isAuthenticated"
      class="relative w-full flex flex-col gap-6 overflow-x-clip xl:pr-[280px] 2xl:pr-[360px]"
    >
      <!-- Right-side Decorative Mascot Bar (Figma Frame 44:667) -->
      <NuxtLink
        to="/chatbot"
        class="fixed right-0 top-20 bottom-0 w-[240px] xl:w-[320px] 2xl:w-[354px] z-30 hidden xl:flex items-center justify-end overflow-visible select-none group cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
        title="Ngobrol dengan Podo AI Companion"
      >
        <div
          class="absolute right-48 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-stone-900/90 text-white text-xs font-extrabold px-3.5 py-2 rounded-2xl shadow-lg pointer-events-none whitespace-nowrap flex items-center gap-1.5"
        >
          <Icon name="lucide:message-circle" class="w-3.5 h-3.5 text-orange-400" />
          <span>Tanya Podo AI</span>
        </div>

        <img
          src="/pomodoro_right_bar.svg"
          alt="Podo Mascot Background"
          class="h-full max-h-[95vh] object-contain object-right drop-shadow-md transition-all group-hover:brightness-105"
        />
      </NuxtLink>

      <!-- Top Welcome & Mood Status Header -->
      <div
        class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xs p-4 sm:p-6 rounded-3xl border border-orange-200 shadow-xs"
      >
        <div>
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Aktif • Selamat Belajar</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-stone-900">
            Semangat Fokus,
            <span class="text-orange-500">{{ authStore.user?.name || 'Teman Belajar' }}</span>!
          </h1>
          <p class="text-xs sm:text-sm text-stone-600 mt-1">
            Karakter AI dan ritme Pomodoro siap mendampingi belajarmu hari ini.
          </p>
        </div>

        <!-- Today's Mood Widget -->
        <div class="flex items-center gap-3">
          <div
            v-if="surveyStore.todaySurvey"
            class="flex items-center gap-2.5 px-4 py-2 rounded-2xl border"
            :class="moodBadgeInfo?.color || 'bg-orange-100 text-orange-800 border-orange-200'"
          >
            <Icon
              v-if="moodBadgeInfo"
              :name="moodBadgeInfo.icon"
              class="w-5 h-5 shrink-0"
            />
            <div>
              <span class="text-[11px] block font-medium opacity-80">Mood Hari Ini:</span>
              <span class="text-xs font-black">{{ surveyStore.todaySurvey.mood }}</span>
            </div>
            <button
              type="button"
              class="ml-2 text-xs font-bold underline hover:opacity-75 cursor-pointer"
              title="Ubah Mood"
              @click="surveyStore.openModal"
            >
              Ubah
            </button>
          </div>

          <button
            v-else
            type="button"
            class="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-transform hover:scale-105 cursor-pointer"
            @click="surveyStore.openModal"
          >
            <Icon name="lucide:smile" class="w-4 h-4" />
            <span>Isi Mood Hari Ini</span>
          </button>
        </div>
      </div>

      <!-- Main Desktop Side-by-Side: TaskList (Left) & PomodoroTimer (Center/Right) -->
      <div class="w-full flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-8 relative z-10">
        <!-- My Task Component -->
        <div class="w-full lg:w-80 shrink-0">
          <TaskList />
        </div>

        <!-- Pomodoro Timer Stage -->
        <div class="flex-1 w-full max-w-4xl">
          <PomodoroTimer />
        </div>
      </div>

      <!-- Mandatory Mood Survey Modal -->
      <MoodSurveyModal />

      <!-- Achievement Celebration Modal -->
      <AchievementCelebrationModal />
    </div>

    <!-- TAMPILAN JIKA GUEST (Belum Login) -->
    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-8 sm:py-12 w-full"
    >
      <!-- Title Tagline -->
      <div class="text-center">
        <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">
          Mulai fokus belajar dengan <span class="text-orange-500">Podo</span>
        </h1>
        <p class="text-[15px] font-semibold mt-4">Yuk, belajar bareng Podo! Fokus sebentar, istirahat sejenak. Podo bantu ingetin kamu buat belajar lebih teratur.</p>
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
  </NuxtLayout>
</template>
