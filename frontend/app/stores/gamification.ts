import { defineStore } from 'pinia'
import type { GamificationStats, GamificationResponse } from '~/types/gamification'
import { useAuthStore } from '~/stores/auth'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    stats: null as GamificationStats | null,
    isLoading: false,
    lastFetchedAt: null as number | null,
  }),

  getters: {
    streakDays: (state): number => state.stats?.current_streak ?? 0,
    totalMinutes: (state): number => state.stats?.total_focus_time ?? 0,
    formattedFocusTime: (state): string => {
      const minutes = state.stats?.total_focus_time ?? 0
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (hours > 0) {
        return `${hours}j ${remainingMinutes}m`
      }
      return `${remainingMinutes} menit`
    },
    achievements: (state) => {
      const streak = state.stats?.current_streak ?? 0
      const totalMinutes = state.stats?.total_focus_time ?? 0

      return [
        {
          id: 'streak-first',
          title: 'Langkah Awal (1 Hari)',
          description: 'Menyelesaikan sesi Pomodoro hari pertama',
          unlocked: streak >= 1,
          threshold: 1,
          current: Math.min(streak, 1),
          icon: 'lucide:flame',
        },
        {
          id: 'streak-7',
          title: 'Konsistensi Mingguan (7 Hari)',
          description: 'Pertahankan streak fokus selama 7 hari berturut-turut',
          unlocked: streak >= 7,
          threshold: 7,
          current: Math.min(streak, 7),
          icon: 'lucide:sparkles',
        },
        {
          id: 'streak-pro',
          title: 'Streak Pro (30 Days)',
          description: 'Fokus belajar tak terhentikan selama 30 hari penuh',
          unlocked: streak >= 30,
          threshold: 30,
          current: Math.min(streak, 30),
          icon: 'lucide:flame',
        },
        {
          id: 'streak-max',
          title: 'Streak Max (50 Days)',
          description: 'Dedikasi luar biasa 50 hari konsisten',
          unlocked: streak >= 50,
          threshold: 50,
          current: Math.min(streak, 50),
          icon: 'lucide:crown',
        },
        {
          id: 'focus-century',
          title: 'Master Fokus (100 Jam)',
          description: 'Mencapai total 6.000 menit waktu belajar produktif',
          unlocked: totalMinutes >= 6000,
          threshold: 6000,
          current: Math.min(totalMinutes, 6000),
          icon: 'lucide:award',
        },
      ]
    },
    unlockedAchievementsCount(): number {
      return this.achievements.filter(a => a.unlocked).length
    },
  },

  actions: {
    async fetchStats() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isLoading = true
      try {
        const res = await useApiFetch<GamificationResponse>('/api/gamification/stats', {
          method: 'GET',
        })
        if (res?.data) {
          this.stats = res.data
          this.lastFetchedAt = Date.now()
        }
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
