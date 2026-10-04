import { defineStore } from 'pinia'
import type { GamificationStats, GamificationResponse } from '~/types/gamification'
import type { PomodoroSession, SessionListResponse } from '~/types/session'
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementsResponse,
  type DisplayAchievement,
} from '~/types/achievement'
import { useAuthStore } from '~/stores/auth'

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    stats: null as GamificationStats | null,
    unlockedCodes: [] as string[],
    sessions: [] as PomodoroSession[],
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
    achievements: (state): DisplayAchievement[] => {
      const streak = state.stats?.current_streak ?? 0
      const totalMinutes = state.stats?.total_focus_time ?? 0

      return Object.values(ACHIEVEMENT_DEFINITIONS).map((def) => {
        const isUnlocked = state.unlockedCodes.includes(def.code)
        let current = 0

        if (def.type === 'session') {
          current = isUnlocked ? 1 : 0
        } else if (def.type === 'minutes') {
          current = Math.min(totalMinutes, def.threshold)
        } else if (def.type === 'streak') {
          current = Math.min(streak, def.threshold)
        }

        return {
          ...def,
          id: def.code,
          unlocked: isUnlocked,
          current,
        }
      })
    },
    unlockedAchievementsCount(): number {
      return this.achievements.filter(a => a.unlocked).length
    },
    dailyLeaderboard: (state) => {
      const map = new Map<string, { dateStr: string, rawDate: Date, totalMinutes: number, sessionCount: number }>()

      for (const s of state.sessions) {
        const dur = s.duration_minutes ?? 0
        if (dur <= 0) continue

        const d = new Date(s.start_time || s.created_at || '')
        if (isNaN(d.getTime())) continue

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        const existing = map.get(key)
        if (existing) {
          existing.totalMinutes += dur
          existing.sessionCount += 1
        } else {
          map.set(key, {
            dateStr: key,
            rawDate: d,
            totalMinutes: dur,
            sessionCount: 1,
          })
        }
      }

      // Urutkan dari total menit terbesar ke terkecil
      const sorted = Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes)

      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      return sorted.map((item, index) => {
        const rank = index + 1
        const d = item.rawDate

        const isToday =
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()

        const isYesterday =
          d.getFullYear() === yesterday.getFullYear() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getDate() === yesterday.getDate()

        const formattedDate = d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        let displayTitle = formattedDate
        if (isToday) {
          displayTitle = `Hari Ini (${formattedDate})`
        } else if (isYesterday) {
          displayTitle = `Kemarin (${formattedDate})`
        }

        let formattedTime = `${item.totalMinutes} menit`
        if (item.totalMinutes >= 60) {
          const h = Math.floor(item.totalMinutes / 60)
          const m = item.totalMinutes % 60
          formattedTime = m > 0 ? `${h}j ${m}m` : `${h} jam`
        }

        let bgClass = 'bg-stone-100/70 text-stone-800'
        let iconColor = 'text-stone-600'
        if (rank === 1) {
          bgClass = 'bg-orange-500/80 text-white'
          iconColor = 'text-amber-300'
        } else if (rank === 2) {
          bgClass = 'bg-orange-400/50 text-stone-900'
          iconColor = 'text-orange-600'
        } else if (rank === 3) {
          bgClass = 'bg-orange-300/30 text-stone-800'
          iconColor = 'text-orange-700'
        }

        return {
          rank,
          title: displayTitle,
          time: formattedTime,
          totalMinutes: item.totalMinutes,
          sessionCount: item.sessionCount,
          bgClass,
          iconColor,
          isTrophy: rank === 1,
        }
      })
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

      // Also refresh achievements and session history
      await Promise.all([
        this.fetchAchievements(),
        this.fetchSessions(),
      ])
    },

    async fetchAchievements() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const res = await useApiFetch<AchievementsResponse>('/api/achievements', {
          method: 'GET',
        })
        if (res?.unlocked_codes && Array.isArray(res.unlocked_codes)) {
          this.unlockedCodes = res.unlocked_codes
        } else if (res?.data && Array.isArray(res.data)) {
          this.unlockedCodes = res.data.map(a => a.achievement_code)
        }
      } catch (error) {
        console.error('Failed to fetch achievements from server:', error)
      }
    },

    async fetchSessions() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const res = await useApiFetch<SessionListResponse>('/api/sessions', {
          method: 'GET',
        })
        if (res?.data && Array.isArray(res.data)) {
          this.sessions = res.data
        }
      } catch (error) {
        console.error('Failed to fetch sessions history:', error)
      }
    },
  },
})
