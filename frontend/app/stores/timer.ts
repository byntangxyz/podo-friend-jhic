import { defineStore } from 'pinia'
import type { SessionResponse } from '~/types/session'
import { useAuthStore } from '~/stores/auth'
import { useGamificationStore } from '~/stores/gamification'

export const useTimerStore = defineStore('timer', {
  state: () => ({
    timeLeft: 25 * 60, // 25 minutes default (in seconds)
    totalDuration: 25 * 60,
    isRunning: false,
    currentSessionId: null as string | null,
    mode: 'work' as 'work' | 'break',
    activeTask: 'Belajar Python',
    isLoadingSession: false,
    timerIntervalId: null as ReturnType<typeof setInterval> | null,
    isCompletedModalOpen: false,
    completedDurationMinutes: 0,
  }),

  getters: {
    formattedTime: (state): string => {
      const minutes = Math.floor(state.timeLeft / 60)
      const seconds = state.timeLeft % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    progressPercentage: (state): number => {
      if (state.totalDuration <= 0) return 0
      return Math.round(((state.totalDuration - state.timeLeft) / state.totalDuration) * 100)
    },
  },

  actions: {
    setDuration(minutes: number, mode: 'work' | 'break' = 'work') {
      this.pause()
      this.mode = mode
      this.totalDuration = minutes * 60
      this.timeLeft = this.totalDuration
    },

    setActiveTask(taskName: string) {
      this.activeTask = taskName
    },

    async start() {
      if (this.isRunning) return

      const authStore = useAuthStore()

      // Jika user sudah login dan belum memiliki session ID aktif, inisiasi sesi di backend
      if (authStore.isAuthenticated && !this.currentSessionId) {
        this.isLoadingSession = true
        try {
          const res = await useApiFetch<SessionResponse>('/api/sessions', {
            method: 'POST',
          })
          if (res?.data?.id) {
            this.currentSessionId = res.data.id
          }
        } catch (error) {
          console.error('Failed to initiate Pomodoro session on server:', error)
        } finally {
          this.isLoadingSession = false
        }
      }

      this.isRunning = true

      // Mulai hitung mundur interval (1 detik)
      if (this.timerIntervalId) clearInterval(this.timerIntervalId)
      this.timerIntervalId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--
        } else {
          this.completeSession()
        }
      }, 1000)
    },

    pause() {
      this.isRunning = false
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId)
        this.timerIntervalId = null
      }
    },

    reset() {
      this.pause()
      this.timeLeft = this.totalDuration
    },

    skip() {
      this.pause()
      if (this.mode === 'work') {
        this.setDuration(5, 'break')
      } else {
        this.setDuration(25, 'work')
      }
    },

    async completeSession() {
      this.pause()
      const authStore = useAuthStore()
      const gamificationStore = useGamificationStore()

      const spentSeconds = this.totalDuration - this.timeLeft
      this.completedDurationMinutes = Math.max(1, Math.ceil(spentSeconds / 60))

      if (authStore.isAuthenticated && this.currentSessionId) {
        this.isLoadingSession = true
        try {
          await useApiFetch<SessionResponse>(`/api/sessions/${this.currentSessionId}`, {
            method: 'PUT',
          })
          // Update gamification stats
          await gamificationStore.fetchStats().catch(() => {})
        } catch (error) {
          console.error('Failed to complete Pomodoro session on server:', error)
        } finally {
          this.isLoadingSession = false
          this.currentSessionId = null
        }
      }

      this.isCompletedModalOpen = true
      this.reset()
    },

    closeCompletedModal() {
      this.isCompletedModalOpen = false
    },
  },
})
