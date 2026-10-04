import { defineStore } from 'pinia'
import type { SessionResponse } from '~/types/session'
import { useAuthStore } from '~/stores/auth'
import { useGamificationStore } from '~/stores/gamification'

export type StudyModeKey = 'cepat' | 'normal' | 'lambat'

export interface StudyModeConfig {
  key: StudyModeKey
  label: string
  focusMinutes: number
  breakMinutes: number
  description: string
  assetSvg: string
}

export const STUDY_MODES: Record<StudyModeKey, StudyModeConfig> = {
  cepat: {
    key: 'cepat',
    label: 'Mode Cepat',
    focusMinutes: 15,
    breakMinutes: 3,
    description: 'Sesi fokus 15 menit, istirahat 3 menit. Pas untuk tugas ringan atau kilat.',
    assetSvg: '/surveys/pilihModeCepat.svg',
  },
  normal: {
    key: 'normal',
    label: 'Mode Normal',
    focusMinutes: 25,
    breakMinutes: 5,
    description: 'Sesi fokus 25 menit, istirahat 5 menit. Standar Pomodoro seimbang & konsisten.',
    assetSvg: '/surveys/pilihModeNormal.svg',
  },
  lambat: {
    key: 'lambat',
    label: 'Mode Lambat',
    focusMinutes: 40,
    breakMinutes: 10,
    description: 'Sesi fokus 40 menit, istirahat 10 menit. Sesi fokus mendalam (deep work).',
    assetSvg: '/surveys/pilihModeLambat.svg',
  },
}

// Global audio references untuk looping alarm
let alarmAudioInstance: HTMLAudioElement | null = null
let audioContextInstance: AudioContext | null = null
let synthChimeIntervalId: ReturnType<typeof setInterval> | null = null
let isAlarmCurrentlyPlaying = false

// Membuka kunci (unlock) browser autoplay restriction saat ada interaksi user
export function unlockAudio() {
  if (typeof window === 'undefined') return
  try {
    if (!alarmAudioInstance) {
      alarmAudioInstance = new Audio('/sounds/timer-alarm.mp3')
      alarmAudioInstance.loop = true
      alarmAudioInstance.preload = 'auto'
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx && !audioContextInstance) {
      audioContextInstance = new AudioCtx()
    }
    if (audioContextInstance && audioContextInstance.state === 'suspended') {
      audioContextInstance.resume().catch(() => {})
    }
  } catch (e) {
    console.warn('[PodoAlarm] unlockAudio skipped:', e)
  }
}

// Pasang listener satu kali untuk auto-unlock audio saat user menyentuh/klik halaman pertama kali
if (typeof window !== 'undefined') {
  const onFirstGesture = () => {
    unlockAudio()
    window.removeEventListener('click', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
    window.removeEventListener('touchstart', onFirstGesture)
  }
  window.addEventListener('click', onFirstGesture, { once: true, passive: true })
  window.addEventListener('keydown', onFirstGesture, { once: true, passive: true })
  window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true })
}

// Helper memutar suara alarm secara berulang (loop) sampai dimatikan
export function playAlarmSound() {
  if (typeof window === 'undefined') return
  stopAlarmSound()
  isAlarmCurrentlyPlaying = true

  // 1. Coba memutar file audio kustom dengan mode loop
  try {
    if (!alarmAudioInstance) {
      alarmAudioInstance = new Audio('/sounds/timer-alarm.mp3')
      alarmAudioInstance.loop = true
      alarmAudioInstance.preload = 'auto'
    }
    alarmAudioInstance.currentTime = 0
    alarmAudioInstance.volume = 1.0

    const playPromise = alarmAudioInstance.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Berhasil memutar file audio kustom secara loop
          console.log('[PodoAlarm] Playing timer-alarm.mp3 in loop mode')
        })
        .catch((err) => {
          // Jika file audio diblokir autoplay atau format tidak terbaca, fallback ke synthesizer berulang
          console.warn('[PodoAlarm] Audio play failed or blocked, activating synthesizer chime fallback:', err)
          startRepeatingSynthChime()
        })
    }
  } catch (err) {
    console.warn('[PodoAlarm] Audio constructor error, fallback to synth chime:', err)
    startRepeatingSynthChime()
  }
}

// Menghentikan loop suara alarm
export function stopAlarmSound() {
  isAlarmCurrentlyPlaying = false

  if (alarmAudioInstance) {
    try {
      alarmAudioInstance.pause()
      alarmAudioInstance.currentTime = 0
    } catch {}
  }

  if (synthChimeIntervalId) {
    clearInterval(synthChimeIntervalId)
    synthChimeIntervalId = null
  }
}

// Fallback looping Web Audio API jika file audio belum ada atau diblokir browser
function startRepeatingSynthChime() {
  playSynthesizedChime()
  if (synthChimeIntervalId) clearInterval(synthChimeIntervalId)
  synthChimeIntervalId = setInterval(() => {
    if (!isAlarmCurrentlyPlaying) {
      if (synthChimeIntervalId) clearInterval(synthChimeIntervalId)
      synthChimeIntervalId = null
      return
    }
    playSynthesizedChime()
  }, 1800)
}

// Synthesizer Web Audio API: Bunyi melodi chime bertingkat yang jernih dan ramah
function playSynthesizedChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    if (!audioContextInstance) {
      audioContextInstance = new AudioCtx()
    }
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume().catch(() => {})
    }

    const ctx = audioContextInstance
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6 (chord ramah)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.12)

      gain.gain.setValueAtTime(0.001, now + idx * 0.12)
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.12)
      osc.stop(now + idx * 0.12 + 1.2)
    })
  } catch (err) {
    console.warn('Web Audio chime playback skipped:', err)
  }
}

export const useTimerStore = defineStore('timer', {
  state: () => {
    // Muat preferensi mode belajar dari localStorage jika ada
    let initialMode: StudyModeKey = 'normal'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('podo_study_mode') as StudyModeKey | null
      if (saved && STUDY_MODES[saved]) {
        initialMode = saved
      }
    }

    const defaultFocusMinutes = STUDY_MODES[initialMode].focusMinutes

    return {
      studyMode: initialMode as StudyModeKey,
      timeLeft: defaultFocusMinutes * 60,
      totalDuration: defaultFocusMinutes * 60,
      isRunning: false,
      currentSessionId: null as string | null,
      mode: 'work' as 'work' | 'break',
      activeTask: 'Belajar Python',
      isLoadingSession: false,
      timerIntervalId: null as ReturnType<typeof setInterval> | null,
      isCompletedModalOpen: false,
      completedDurationMinutes: 0,
      newlyUnlockedAchievements: [] as string[],
      isAchievementCelebrationOpen: false,
      // Status break wajib: saat user menyelesaikan waktu fokus penuh, break wajib dijalani
      isBreakMandatory: false,
      // Status alarm suara aktif berulang
      isAlarmActive: false,
      // Mode yang baru saja diselesaikan ('work' atau 'break')
      lastCompletedMode: 'work' as 'work' | 'break',
    }
  },

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
    currentStudyConfig: (state): StudyModeConfig => {
      return STUDY_MODES[state.studyMode] || STUDY_MODES.normal
    },
  },

  actions: {
    // Mengatur Mode Belajar (Cepat 15m, Normal 25m, Lambat 40m)
    setStudyMode(modeKey: StudyModeKey) {
      if (!STUDY_MODES[modeKey]) return
      this.studyMode = modeKey

      if (typeof window !== 'undefined') {
        localStorage.setItem('podo_study_mode', modeKey)
      }

      // Jika timer sedang tidak berjalan dan bukan dalam status break wajib, perbarui durasi timer
      if (!this.isRunning && !this.isBreakMandatory) {
        const config = STUDY_MODES[modeKey]
        const minutes = this.mode === 'work' ? config.focusMinutes : config.breakMinutes
        this.setDuration(minutes, this.mode)
      }
    },

    setDuration(minutes: number, mode: 'work' | 'break' = 'work') {
      // Jika dalam status break wajib, pengguna dilarang kembali ke sesi 'work' sebelum istirahat selesai
      if (this.isBreakMandatory && mode === 'work') {
        console.warn('Sesi istirahat wajib dijalani terlebih dahulu sebelum kembali ke sesi fokus.')
        return
      }

      this.pause()
      this.mode = mode
      this.totalDuration = minutes * 60
      this.timeLeft = this.totalDuration
    },

    setActiveTask(taskName: string) {
      this.activeTask = taskName
    },

    async start() {
      unlockAudio()
      if (this.isRunning) return

      const authStore = useAuthStore()

      // Jika user sudah login dan belum memiliki session ID aktif (hanya pada sesi fokus), inisiasi sesi di backend
      if (this.mode === 'work' && authStore.isAuthenticated && !this.currentSessionId) {
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
          this.onTimerExpired()
        }
      }, 1000)
    },

    // Dipanggil saat countdown mencapai 00:00
    onTimerExpired() {
      // 1. Bunyikan Alarm Timer Habis berulang (loop)
      this.isAlarmActive = true
      playAlarmSound()

      if (this.mode === 'work') {
        // Pengguna menyelesaikan sesi fokus secara penuh -> Wajib Masuk ke Sesi Break
        this.lastCompletedMode = 'work'
        this.isBreakMandatory = true
        this.completeSession()

        // Otomatis siapkan durasi break sesuai mode belajar aktif
        const config = this.currentStudyConfig
        this.setDuration(config.breakMinutes, 'break')
      } else {
        // Sesi istirahat (break) telah selesai -> Selesaikan break wajib
        this.lastCompletedMode = 'break'
        this.isBreakMandatory = false
        this.pause()
        const config = this.currentStudyConfig
        this.setDuration(config.focusMinutes, 'work')
        this.isCompletedModalOpen = true
      }
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
      // Jika dalam sesi break wajib, pengguna DILARANG melewatkan break
      if (this.isBreakMandatory && this.mode === 'break') {
        console.warn('Istirahat wajib tidak boleh dilewati.')
        return
      }

      this.pause()
      const config = this.currentStudyConfig
      if (this.mode === 'work') {
        this.setDuration(config.breakMinutes, 'break')
      } else {
        this.setDuration(config.focusMinutes, 'work')
      }
    },

    async completeSession() {
      this.pause()
      this.lastCompletedMode = this.mode
      this.isAlarmActive = true
      playAlarmSound()
      const authStore = useAuthStore()
      const gamificationStore = useGamificationStore()

      const spentSeconds = this.totalDuration - this.timeLeft
      this.completedDurationMinutes = Math.max(1, Math.ceil(spentSeconds / 60))

      if (authStore.isAuthenticated && this.currentSessionId) {
        this.isLoadingSession = true
        try {
          const res = await useApiFetch<SessionResponse>(`/api/sessions/${this.currentSessionId}`, {
            method: 'PUT',
          })

          const newCodes = res?.meta?.newly_unlocked_achievements
          if (Array.isArray(newCodes) && newCodes.length > 0) {
            this.newlyUnlockedAchievements = newCodes
            this.isAchievementCelebrationOpen = true

            try {
              const { showToast } = useToast()
              const firstCode = newCodes[0] || ''
              if (firstCode.includes('streak')) {
                showToast('Kamu membuka Streak Belajar!')
              } else {
                showToast('Kamu membuka Pencapaian Baru!')
              }
            } catch (err) {
              console.warn('Toast display skipped:', err)
            }
          }

          // Update gamification stats & achievements
          await gamificationStore.fetchStats().catch(() => {})
        } catch (error) {
          console.error('Failed to complete Pomodoro session on server:', error)
        } finally {
          this.isLoadingSession = false
          this.currentSessionId = null
        }
      }

      // Jika selesai dari mode istirahat (break), bebaskan break wajib
      if (this.mode === 'break') {
        this.isBreakMandatory = false
      }

      this.isCompletedModalOpen = true
      this.reset()
    },

    // Alias for completeSession per documentation convention
    async stopSession() {
      await this.completeSession()
    },

    // Mematikan suara alarm yang sedang me-loop
    dismissAlarm() {
      this.isAlarmActive = false
      stopAlarmSound()
    },

    // CTA Lanjut ke Sesi Istirahat (Break) sekaligus matikan alarm
    proceedToBreak() {
      this.dismissAlarm()
      this.closeCompletedModal()
      this.isBreakMandatory = true
      const config = this.currentStudyConfig
      this.setDuration(config.breakMinutes, 'break')
      this.start()
    },

    // CTA Lanjut ke Sesi Fokus sekaligus matikan alarm
    proceedToFocus() {
      this.dismissAlarm()
      this.closeCompletedModal()
      this.isBreakMandatory = false
      const config = this.currentStudyConfig
      this.setDuration(config.focusMinutes, 'work')
      this.start()
    },

    closeCompletedModal() {
      this.dismissAlarm()
      this.isCompletedModalOpen = false
    },

    closeAchievementCelebration() {
      this.isAchievementCelebrationOpen = false
      this.newlyUnlockedAchievements = []
    },
  },
})
