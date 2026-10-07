<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'Progress & Gamifikasi',
})

const authStore = useAuthStore()
const gamificationStore = useGamificationStore()

onMounted(async () => {
  await gamificationStore.fetchStats()
})

const streak = computed(() => gamificationStore.streakDays)
const focusTime = computed(() => gamificationStore.formattedFocusTime)
const achievementPercentage = computed(() => {
  const total = gamificationStore.achievements.length
  if (total === 0) return 0
  return Math.round((gamificationStore.unlockedAchievementsCount / total) * 100)
})

const isStreakActive = computed(() => {
  const lastActiveStr = gamificationStore.stats?.last_active_date
  if (!lastActiveStr) return false
  if ((gamificationStore.stats?.current_streak ?? 0) <= 0) return false

  const lastActive = new Date(lastActiveStr)
  const today = new Date()

  return (
    lastActive.getFullYear() === today.getFullYear() &&
    lastActive.getMonth() === today.getMonth() &&
    lastActive.getDate() === today.getDate()
  )
})

// Leaderboard data riil dari sesi Pomodoro harian 30 hari terakhir (terbanyak ke terendah)
const leaderboardItems = computed(() => gamificationStore.dailyLeaderboard)
</script>

<template>
  <div class="w-full flex flex-col gap-8 max-w-6xl mx-auto py-2">
    <!-- User Profile Header Card (Figma #73:1964) -->
    <div
      class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
    >
      <div class="flex items-center gap-5 sm:gap-6 text-center sm:text-left">
        <!-- User Avatar Vector -->
        <div
          class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center shrink-0 shadow-xs"
        >
          <Icon name="lucide:user" class="w-12 h-12 text-stone-900" />
        </div>

        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-1">
            <Icon name="lucide:badge-check" class="w-4 h-4 text-orange-600" />
            <span>Pelajar Aktif</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {{ authStore.user?.name || 'Pelajar Podo' }}
          </h1>
          <p class="text-xs sm:text-sm text-stone-500 mt-0.5">
            {{ authStore.user?.email }}
          </p>
        </div>
      </div>

      <!-- Quick Actions / Navigation -->
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/dashboard"
          class="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Icon name="lucide:play" class="w-4 h-4 fill-white" />
          <span>Lanjut Belajar</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Big Streak Banner Showcase (Figma #60:1658) -->
    <div
      class="bg-white rounded-3xl border border-stone-800 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-md relative overflow-hidden"
    >
      <!-- Left: Giant Flame Icon with Streak Number inside -->
      <div class="relative flex items-center justify-center shrink-0">
        <!-- Flame SVG Background -->
        <div
          class="w-24 h-24 sm:w-40 sm:h-40 flex items-center justify-center transition-all"
          :class="isStreakActive ? 'animate-pulse drop-shadow-[0_4px_12px_rgba(245,106,22,0.35)]' : 'opacity-40 grayscale'"
        >
          <img
            src="/FireStreak.svg"
            alt="Fire Streak Icon"
            class="w-full h-full object-contain"
          />
        </div>
        <!-- Streak text overlay -->
        <div class="absolute inset-0 flex items-center justify-center pt-10">
          <span
            class="text-4xl sm:text-6xl font-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
            :class="isStreakActive ? 'text-stone-900' : 'text-stone-600'"
          >
            {{ streak }}
          </span>
        </div>
      </div>

      <!-- Right: Text Content -->
      <div class="flex-1 text-center md:text-left">
        <!-- Jika Streak Menyala (Berapi-api) -->
        <template v-if="isStreakActive">
          <h2 class="text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
            Kamu sedang berapi-api, <span class="text-orange-600">{{ authStore.user?.name || 'Teman Belajar' }}</span>!
          </h2>
          <p class="text-3xl sm:text-5xl font-black text-stone-900 mt-2 tracking-tight">
            dengan Streak <span class="text-orange-500">{{ streak }} Hari!</span>
          </p>
          <p class="text-sm text-stone-600 mt-3 max-w-xl">
            Luar biasa! Konsistensi belajarmu sangat baik. Kamu sudah mengumpulkan total
            <strong class="text-stone-900">{{ focusTime }}</strong> waktu belajar berkualitas.
          </p>
        </template>

        <!-- Jika Streak Belum Menyala (Ajakan Belajar) -->
        <template v-else>
          <h2 class="text-2xl sm:text-4xl font-bold text-stone-900 leading-tight">
            Yuk, mulai sesi belajarmu, <span class="text-orange-600">{{ authStore.user?.name || 'Teman Belajar' }}</span>!
          </h2>
          <p class="text-2xl sm:text-4xl font-black text-stone-900 mt-2 tracking-tight">
            <span v-if="streak > 0">
              Pertahankan Streak <span class="text-orange-500">{{ streak }} Hari</span> hari ini!
            </span>
            <span v-else>
              Mulai Sesi Fokus &amp; Bangun <span class="text-orange-500">Streak Pertama</span>!
            </span>
          </p>
          <p class="text-sm text-stone-600 mt-3 max-w-xl">
            Selesaikan minimal 1 sesi Pomodoro hari ini untuk menyalakan apimu dan menjaga konsistensi belajarmu bersama Podo.
          </p>
          <NuxtLink
            to="/dashboard"
            class="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm shadow transition-all hover:scale-105"
          >
            <Icon name="lucide:play" class="w-4 h-4 fill-white" />
            <span>Mulai Belajar Sekarang</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Two-Column Section: Leaderboard (Left) & Achievements (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Column 1: Personal Leaderboard (30 Hari) (Figma #60:1870) -->
      <div class="lg:col-span-7 bg-white rounded-3xl border border-stone-800 shadow-md overflow-hidden flex flex-col">
        <!-- Card Header -->
        <div class="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 text-center">
          <h3 class="text-xl sm:text-2xl font-black text-stone-900">
            Personal Leaderboard (30 Hari)
          </h3>
          <p class="text-xs text-stone-500 mt-1">
            Daftar hari-hari paling produktifmu selama sebulan terakhir.
          </p>
        </div>

        <!-- Leaderboard Rows (Figma #60:1861, #60:1878, #60:1893) -->
        <div v-if="leaderboardItems.length > 0" class="divide-y divide-orange-200/60">
          <div
            v-for="item in leaderboardItems"
            :key="item.rank"
            class="p-4 sm:p-5 flex items-center gap-4 sm:gap-6 transition-all"
            :class="item.bgClass"
          >
            <!-- Rank / Trophy Icon -->
            <div class="w-12 h-12 rounded-2xl bg-white/40 flex items-center justify-center shrink-0 font-black text-xl">
              <Icon
                v-if="item.isTrophy"
                name="lucide:trophy"
                class="w-7 h-7"
                :class="item.iconColor"
              />
              <span v-else :class="item.iconColor">{{ item.rank }}</span>
            </div>

            <!-- Title & Session Time -->
            <div class="flex-1 min-w-0">
              <p
                class="font-extrabold text-base sm:text-lg truncate"
                :class="item.rank === 1 ? 'text-white' : 'text-stone-900'"
              >
                {{ item.title }}
              </p>
              <p
                class="text-xs sm:text-sm font-semibold opacity-90"
                :class="item.rank === 1 ? 'text-white/90' : 'text-stone-600'"
              >
                Total fokus: {{ item.time }} • {{ item.sessionCount }} sesi
              </p>
            </div>

            <div class="shrink-0 text-right">
              <span
                class="text-xs font-black uppercase px-2.5 py-1 rounded-full"
                :class="item.rank === 1 ? 'bg-white/20 text-white' : 'bg-white/50 text-stone-700'"
              >
                Rank #{{ item.rank }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State jika belum ada riwayat sesi -->
        <div v-else class="p-8 text-center flex flex-col items-center justify-center gap-3">
          <div class="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
            <Icon name="lucide:calendar-clock" class="w-7 h-7" />
          </div>
          <p class="font-extrabold text-stone-800 text-base">
            Belum Ada Riwayat Sesi
          </p>
          <p class="text-xs text-stone-500 max-w-sm">
            Yuk selesaikan sesi Pomodoromu! Catatan hari-hari paling produktif akan muncul di sini.
          </p>
        </div>

        <!-- Card Footer -->
        <div class="p-4 bg-stone-50 border-t border-stone-200 text-center text-xs text-stone-500 font-semibold">
          Pencatatan waktu belajar diperbarui otomatis setelah setiap sesi Pomodoro selesai.
        </div>
      </div>

      <!-- Column 2: Pencapaian / Achievements (Figma #60:1961) -->
      <div class="lg:col-span-5 bg-white rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-md flex flex-col gap-6">
        <!-- Header with Icon & Counter -->
        <div class="flex items-center gap-4 border-b border-orange-100 pb-5">
          <div class="w-16 h-16 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0">
            <Icon name="lucide:award" class="w-9 h-9 text-orange-500" />
          </div>
          <div class="flex-1">
            <h3 class="text-2xl font-black text-orange-500">
              Pencapaian
            </h3>
            <div class="flex items-center justify-between text-xs font-bold text-stone-700 mt-1">
              <span>{{ gamificationStore.unlockedAchievementsCount }} / {{ gamificationStore.achievements.length }} Dimiliki</span>
              <span>{{ achievementPercentage }}%</span>
            </div>
            <!-- Progress Bar (Figma #60:1931) -->
            <div class="w-full bg-stone-200 rounded-full h-3 mt-2 overflow-hidden">
              <div
                class="bg-orange-500 h-full rounded-full transition-all duration-500"
                :style="{ width: `${achievementPercentage}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Achievement Cards List (Figma #60:1944, #60:1957) -->
        <div class="flex flex-col gap-3.5">
          <div
            v-for="ach in gamificationStore.achievements"
            :key="ach.id"
            class="p-4 rounded-3xl border transition-all flex items-center gap-4"
            :class="ach.unlocked ? 'bg-[#FFC9A8] border-orange-300 shadow-xs' : 'bg-stone-50 border-stone-200 opacity-60'"
          >
            <!-- Badge Circle Icon -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              :class="ach.unlocked ? 'bg-white shadow-xs' : 'bg-stone-200'"
            >
              <Icon
                :name="ach.icon"
                class="w-6 h-6"
                :class="ach.unlocked ? 'text-orange-500' : 'text-stone-400'"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-extrabold text-stone-900 truncate">
                  {{ ach.title }}
                </h4>
                <Icon
                  v-if="ach.unlocked"
                  name="lucide:check"
                  class="w-4 h-4 text-emerald-600 stroke-[3]"
                />
              </div>
              <p class="text-xs text-stone-600 line-clamp-1">
                {{ ach.description }}
              </p>
              <div class="mt-1 flex items-center justify-between text-[10px] text-stone-500 font-bold">
                <span>Progress: {{ ach.current }}/{{ ach.threshold }}</span>
                <span v-if="ach.unlocked" class="text-emerald-700 font-black">Terbuka ✓</span>
                <span v-else class="text-stone-400">Terkunci</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
