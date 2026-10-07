<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
});

useHead({
  title: 'Dashboard Belajar',
});

const authStore = useAuthStore();
const surveyStore = useSurveyStore();
const gamificationStore = useGamificationStore();
const timerStore = useTimerStore();

// Cek status survey harian & ambil statistik saat halaman dimuat
onMounted(async () => {
  await Promise.all([
    surveyStore.fetchTodaySurvey(),
    gamificationStore.fetchStats(),
  ]);
});

const moodBadgeInfo = computed(() => {
  const m = surveyStore.todaySurvey?.mood;
  switch (m) {
    case 'Energetic':
      return {
        icon: 'lucide:zap',
        color: 'text-amber-600 bg-amber-100 border-amber-300',
      };
    case 'Balanced':
      return {
        icon: 'lucide:scale',
        color: 'text-emerald-600 bg-emerald-100 border-emerald-300',
      };
    case 'Tired':
      return {
        icon: 'lucide:battery-low',
        color: 'text-orange-600 bg-orange-100 border-orange-300',
      };
    case 'Overwhelmed':
      return {
        icon: 'lucide:cloud-lightning',
        color: 'text-rose-600 bg-rose-100 border-rose-300',
      };
    case 'Distracted':
      return {
        icon: 'lucide:compass',
        color: 'text-sky-600 bg-sky-100 border-sky-300',
      };
    default:
      return null;
  }
});
const moodDisplayLabel = computed(() => {
  const m = surveyStore.todaySurvey?.mood;
  switch (m) {
    case 'Energetic':
      return 'Sangat Fokus';
    case 'Distracted':
      return 'Kurang Fokus';
    case 'Tired':
      return 'Lelah';
    case 'Overwhelmed':
      return 'Kewalahan';
    case 'Balanced':
      return 'Stabil & Santai';
    default:
      return m || 'Belum Ada';
  }
});
</script>

<template>
  <div class="relative w-full flex flex-col gap-6 overflow-x-clip xl:pr-[280px] 2xl:pr-[360px]">
    <!-- Right-side Reactive Interactive Mascot Bar -->
    <SidebarMascot />

    <!-- Main Desktop Side-by-Side: TaskList (Left) & PomodoroTimer Column (Center/Right) -->
    <div class="w-full flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-8 relative z-10">
      <!-- Left Column: Task List Sidebar -->
      <div class="w-full lg:w-80 shrink-0">
        <TaskList />
      </div>

      <!-- Center Column: Welcome Header & PomodoroTimer (Sejajar dan Simetris) -->
      <div class="flex-1 w-full max-w-4xl flex flex-col gap-6 items-center">
        <!-- Top Welcome & Mood Status Header -->
        <div
          class="w-full relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xs p-4 sm:p-6 rounded-3xl border border-orange-200 shadow-xs"
        >
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-stone-900">
              Yuk belajar,
              <span class="text-orange-500">{{
                authStore.user?.name || 'Teman Belajar'
              }}</span
              >
            </h1>
            <p class="text-xs sm:text-sm text-stone-600 mt-1">
              Podo selalu ada buat kamu.
            </p>
          </div>

          <!-- Preferensi Belajar Widget (Sederhana & Bersih) -->
          <div class="flex items-center gap-2.5">
            <div
              v-if="surveyStore.todaySurvey"
              class="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-left"
            >
              <div class="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 text-orange-600">
                <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none">
                  Preferensi Belajar
                </span>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="text-xs font-black text-stone-800">
                    {{ timerStore.currentStudyConfig.label }} ({{ timerStore.currentStudyConfig.focusMinutes }}m)
                  </span>
                  <span class="text-[10px] font-bold text-stone-400">•</span>
                  <span class="text-xs font-semibold text-stone-600">
                    {{ moodDisplayLabel }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                class="ml-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                title="Ganti Preferensi Belajar"
                @click="surveyStore.openModal"
              >
                Ganti
              </button>
            </div>

            <button
              v-else
              type="button"
              class="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-transform hover:scale-105 cursor-pointer"
              @click="surveyStore.openModal"
            >
              <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
              <span>Atur Preferensi Belajar</span>
            </button>
          </div>
        </div>

        <!-- Pomodoro Timer Stage -->
        <PomodoroTimer />
      </div>
    </div>

    <!-- Mandatory Mood Survey Modal (Shows when todaySurvey is null) -->
    <MoodSurveyModal />

    <!-- Achievement Celebration Modal (Shows when a session unlocks new achievements) -->
    <AchievementCelebrationModal />
  </div>
</template>
