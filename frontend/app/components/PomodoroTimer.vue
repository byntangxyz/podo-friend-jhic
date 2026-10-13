<script setup lang="ts">
import type { MascotAnimationState } from '~/types/mascot'
import { unlockAudio } from '~/stores/timer'

const timerStore = useTimerStore()
const authStore = useAuthStore()

onMounted(() => {
  unlockAudio()
})

// Dialog kata-kata Podo yang ramah, alami, dan responsif terhadap status istirahat wajib
const podoSpeech = computed(() => {
  if (timerStore.isBreakMandatory && timerStore.mode === 'break') {
    return 'Waktu fokus selesai! Sekarang wajib istirahat sejenak ya, jangan paksakan belajar terus.'
  }
  if (timerStore.isRunning) {
    return 'Tetap fokus ya, selesaikan satu per satu dulu.'
  }
  if (timerStore.mode === 'break') {
    return 'Saatnya rehat sejenak! Tarik napas, regangkan badan, dan minum air putih.'
  }
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'Sesi dijeda sebentar. Kalau sudah siap, yuk lanjut lagi!'
  }
  return 'Halo! Aku Podo, teman belajarmu. Yuk, mulai fokus bareng!'
})

// State animasi maskot AI Companion berdasarkan aktivitas Pomodoro
const companionMascotAnimation = computed<MascotAnimationState>(() => {
  if (timerStore.isCompletedModalOpen) {
    return 'excited'
  }
  if (timerStore.mode === 'break') {
    return 'sleepy'
  }
  if (timerStore.isRunning) {
    return 'listening'
  }
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'thinking'
  }
  return 'idle'
})

// Picture-in-Picture (Floating Window) Logic
let pipWindowInstance: any = null
const isFloatingActive = ref(false)
const isNativePip = ref(false)
const cardHostRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)

const copyStylesToPip = (pipDoc: Document) => {
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    pipDoc.head.appendChild(node.cloneNode(true))
  })
  if (pipDoc.body) {
    pipDoc.body.style.margin = '0'
    pipDoc.body.style.padding = '16px'
    pipDoc.body.style.boxSizing = 'border-box'
    pipDoc.body.style.backgroundColor = '#FFF7ED'
    pipDoc.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    pipDoc.body.style.display = 'flex'
    pipDoc.body.style.alignItems = 'center'
    pipDoc.body.style.justifyContent = 'center'
    pipDoc.body.style.minHeight = '100vh'
  }
}

const openNativePip = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('documentPictureInPicture' in window)) {
    return false
  }

  try {
    const pipWin = await (window as any).documentPictureInPicture.requestWindow({
      width: 520,
      height: 500,
    })

    pipWindowInstance = pipWin
    copyStylesToPip(pipWin.document)

    isFloatingActive.value = true
    isNativePip.value = true
    await nextTick()

    if (cardRef.value) {
      pipWin.document.body.appendChild(cardRef.value)
    }

    pipWin.addEventListener('pagehide', () => {
      if (cardHostRef.value && cardRef.value) {
        cardHostRef.value.appendChild(cardRef.value)
      }
      pipWindowInstance = null
      isNativePip.value = false
      isFloatingActive.value = false
    })

    return true
  } catch (err) {
    console.warn('Document PiP request failed:', err)
    return false
  }
}

const closeFloating = () => {
  if (pipWindowInstance) {
    if (cardHostRef.value && cardRef.value) {
      cardHostRef.value.appendChild(cardRef.value)
    }
    try {
      pipWindowInstance.close()
    } catch {}
    pipWindowInstance = null
  } else if (cardHostRef.value && cardRef.value && cardRef.value.parentElement !== cardHostRef.value) {
    cardHostRef.value.appendChild(cardRef.value)
  }
  isNativePip.value = false
  isFloatingActive.value = false
}

const togglePictureInPicture = async () => {
  if (isFloatingActive.value) {
    closeFloating()
    return
  }

  // Coba Document Picture-in-Picture API (OS-level always-on-top window) terlebih dahulu
  if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
    const success = await openNativePip()
    if (success) return
  }

  // Fallback: In-page pinned floating card
  isNativePip.value = false
  isFloatingActive.value = true
}

const handleCompleteSession = async () => {
  if (isFloatingActive.value) {
    closeFloating()
  }
  await timerStore.completeSession()
}

// Tutup floating window secara otomatis saat sesi berakhir
watch(
  () => timerStore.isCompletedModalOpen,
  (isOpen) => {
    if (isOpen) {
      closeFloating()
    }
  }
)

onUnmounted(() => {
  closeFloating()
})
</script>

<template>
  <div class="relative w-full flex flex-col items-center">
    <!-- Placeholder di halaman saat kartu sedang mengambang (Floating / PiP) -->
    <div
      v-if="isFloatingActive"
      class="w-full max-w-4xl flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-3xl border-2 border-dashed border-orange-300 p-8 sm:p-12 text-center gap-4 transition-all mb-6"
    >
      <div class="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-500 shadow-xs">
        <Icon name="lucide:picture-in-picture-2" class="w-8 h-8" />
      </div>
      <div>
        <h3 class="text-xl font-black text-stone-900">
          Timer Sedang Melayang (Floating Window)
        </h3>
        <p class="text-sm font-semibold text-stone-600 mt-1 max-w-md">
          Sesi timer Pomodoro sedang aktif pada jendela mengambang. Kamu dapat mengontrol timer dan menyelesaikan sesi di jendela tersebut.
        </p>
      </div>
      <button
        type="button"
        class="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        @click="closeFloating"
      >
        <Icon name="lucide:arrow-down-left" class="w-4 h-4" />
        <span>Kembalikan Timer ke Halaman</span>
      </button>
    </div>

    <!-- Host Container untuk Card Pomodoro Timer -->
    <div ref="cardHostRef" class="w-full flex justify-center">
      <!-- Main Pomodoro Card (Card yang di-float secara utuh) -->
      <div
        ref="cardRef"
        class="w-full flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-orange-400 p-5 sm:p-7 shadow-lg relative overflow-hidden transition-all duration-300"
        :class="[
          isFloatingActive && !isNativePip
            ? 'fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] shadow-2xl border-orange-500 bg-white'
            : 'max-w-4xl'
        ]"
      >
        <!-- Picture-in-Picture / Floating Window Button -->
      <button
        type="button"
        class="absolute top-4 right-4 sm:top-5 sm:right-5 px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer z-10"
        :class="
          isFloatingActive
            ? 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600'
            : 'bg-orange-50 hover:bg-orange-100 text-stone-700 hover:text-orange-600 border-orange-200'
        "
        :title="isFloatingActive ? 'Tutup Floating Window' : 'Buka Picture-in-Picture (Floating Window)'"
        @click="togglePictureInPicture"
      >
        <Icon
          name="lucide:picture-in-picture-2"
          class="w-4 h-4"
          :class="isFloatingActive ? 'text-white' : 'text-orange-500'"
        />
        <span class="hidden sm:inline">{{ isFloatingActive ? 'Tutup PiP' : 'Floating Timer' }}</span>
      </button>

      <!-- Mode Switcher (Work vs Break) -->
      <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-orange-100/80 mb-3 sm:mb-4">
        <button
          type="button"
          :disabled="timerStore.isBreakMandatory"
          class="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2"
          :class="[
            timerStore.mode === 'work' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600',
            timerStore.isBreakMandatory ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          ]"
          :title="timerStore.isBreakMandatory ? 'Selesaikan sesi istirahat wajibmu terlebih dahulu' : 'Sesi Fokus'"
          @click="timerStore.setDuration(timerStore.currentStudyConfig.focusMinutes, 'work')"
        >
          <Icon name="lucide:target" class="w-4 h-4" />
          <span>Fokus ({{ timerStore.currentStudyConfig.focusMinutes }}m)</span>
        </button>
        <button
          type="button"
          class="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2"
          :class="timerStore.mode === 'break' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600'"
          @click="timerStore.setDuration(timerStore.currentStudyConfig.breakMinutes, 'break')"
        >
          <Icon name="lucide:coffee" class="w-4 h-4" />
          <span>Istirahat ({{ timerStore.currentStudyConfig.breakMinutes }}m)</span>
        </button>
      </div>

      <!-- Mandatory Break Notice Banner -->
      <div
        v-if="timerStore.isBreakMandatory"
        class="mb-3 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs"
      >
        <Icon name="lucide:coffee" class="w-4 h-4 text-amber-600 shrink-0" />
        <span>Sesi istirahat wajib dijalani setelah fokus belajar selesai.</span>
      </div>

      <!-- Timer Numbers (Ukuran proporsional, tegas dan rapi) -->
      <div class="py-1 select-none text-center">
        <span
          class="text-6xl sm:text-7xl md:text-8xl font-black text-stone-900 tracking-tight leading-none font-mono"
        >
          {{ timerStore.formattedTime }}
        </span>
      </div>

      <!-- Control Row Buttons (Ukuran seimbang) -->
      <div class="flex items-center justify-center gap-4 sm:gap-6 my-3 sm:my-4">
        <!-- Reset Button -->
        <button
          type="button"
          aria-label="Ulangi Timer"
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all cursor-pointer border border-orange-300"
          @click="timerStore.reset"
        >
          <Icon name="lucide:rotate-ccw" class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <!-- Play / Pause Button -->
        <button
          type="button"
          aria-label="Mulai atau Jeda Timer"
          class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-orange-500 border-4 border-stone-900 text-white flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none hover:bg-orange-600 transition-all cursor-pointer group"
          @click="timerStore.isRunning ? timerStore.pause() : timerStore.start()"
        >
          <Icon
            :name="timerStore.isRunning ? 'lucide:pause' : 'lucide:play'"
            class="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform"
          />
        </button>

        <!-- Skip / Next Button (Disabled saat Break Wajib) -->
        <button
          type="button"
          aria-label="Lewati Sesi"
          :disabled="timerStore.isBreakMandatory"
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all border border-orange-300"
          :class="timerStore.isBreakMandatory ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'"
          :title="timerStore.isBreakMandatory ? 'Istirahat wajib tidak dapat dilewati' : 'Lewati Sesi'"
          @click="timerStore.skip"
        >
          <Icon name="lucide:fast-forward" class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <!-- Selesaikan Sesi CTA Button -->
      <div class="w-full max-w-xs my-1 sm:my-2">
        <button
          type="button"
          class="w-full py-2.5 sm:py-3 px-5 rounded-2xl bg-[#FFC9A8] hover:bg-[#ffb68c] active:scale-[0.98] border border-orange-300 text-[#7D614F] font-black text-base sm:text-lg shadow-[0_3px_0_0_rgba(0,0,0,0.12)] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          @click="handleCompleteSession"
        >
          <Icon name="lucide:check-circle" class="w-5 h-5 text-[#7D614F]" />
          <span>Selesaikan Sesi</span>
        </button>
      </div>

      <!-- Mascot with Speech Bubble (AI Companion langsung terlihat tanpa scroll) -->
      <div class="mt-4 pt-4 border-t border-orange-100 w-full flex items-center justify-center gap-3 sm:gap-5">
        <div class="w-14 h-14 sm:w-16 sm:h-16 shrink-0 transition-transform hover:scale-105">
          <AppMascot
            size="custom"
            custom-class="w-14 h-14 sm:w-16 sm:h-16"
            :animation="companionMascotAnimation"
          />
        </div>

        <!-- Speech bubble with arrow -->
        <div
          class="relative bg-orange-100/80 border border-orange-200 rounded-2xl p-3 sm:p-3.5 text-stone-800 text-xs sm:text-sm font-semibold max-w-md shadow-xs"
        >
          <div
            class="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-200 border-b-8 border-b-transparent"
          />
          <p>{{ podoSpeech }}</p>
        </div>
      </div>
    </div>
  </div>

    <!-- Session Completed Celebration Modal (Pop-up UI dengan Mascot Besar & Matikan Alarm) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="timerStore.isCompletedModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md"
      >
        <div
          class="bg-white rounded-3xl border-2 border-orange-400 p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center relative overflow-hidden flex flex-col items-center"
        >
          <!-- Background decorative glow -->
          <div
            class="absolute -top-16 -right-16 w-44 h-44 bg-orange-200/40 rounded-full blur-3xl pointer-events-none"
          />
          <div
            class="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"
          />

          <!-- Alarm Sound Active Banner Indicator -->
          <div
            v-if="timerStore.isAlarmActive"
            class="mb-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-300 text-orange-800 text-xs font-black animate-pulse shadow-xs"
          >
            <Icon name="lucide:bell-ring" class="w-4 h-4 text-orange-600 animate-bounce" />
            <span>Alarm Berbunyi — Tekan tombol untuk matikan alarm</span>
          </div>

          <!-- Mascot Besar (size="lg" / w-36 h-36) -->
          <div class="w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center mb-3 relative">
            <div
              class="absolute inset-2 bg-gradient-to-b from-orange-100/80 to-amber-50 rounded-full blur-md -z-10"
            />
            <AppMascot size="lg" animation="excited" class="drop-shadow-md" />
          </div>

          <!-- Headline & Keterangan Sesi -->
          <h3 class="text-2xl sm:text-3xl font-black text-stone-900 mb-2 leading-tight">
            {{
              timerStore.lastCompletedMode === 'work'
                ? 'Selamat sesi pertama sudah selesai!'
                : 'Sesi istirahatmu sudah selesai!'
            }}
          </h3>

          <p class="text-xs sm:text-sm text-stone-600 mb-6 max-w-sm">
            <template v-if="timerStore.lastCompletedMode === 'work'">
              Kamu berhasil menyelesaikan sesi fokus selama
              <span class="font-extrabold text-orange-600">{{ timerStore.completedDurationMinutes }} menit</span>.
              Sekarang saatnya rehat sejenak agar pikiran tetap segar!
            </template>
            <template v-else>
              Pikiranmu sudah segar kembali setelah istirahat. Siap untuk lanjut sesi fokus berikutnya?
            </template>
          </p>

          <!-- Action Buttons / CTA Matikan Alarm & Lanjut Sesi -->
          <div class="w-full flex flex-col gap-2.5">
            <!-- Jika sesi fokus baru saja selesai: CTA Lanjut Istirahat (Break Wajib) -->
            <button
              v-if="timerStore.lastCompletedMode === 'work'"
              type="button"
              class="w-full py-3.5 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              @click="timerStore.proceedToBreak"
            >
              <Icon name="lucide:coffee" class="w-5 h-5 shrink-0" />
              <span>Matikan Alarm &amp; Lanjut Istirahat ({{ timerStore.currentStudyConfig.breakMinutes }}m)</span>
            </button>

            <!-- Jika sesi istirahat baru saja selesai: CTA Lanjut Fokus -->
            <button
              v-else
              type="button"
              class="w-full py-3.5 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              @click="timerStore.proceedToFocus"
            >
              <Icon name="lucide:target" class="w-5 h-5 shrink-0" />
              <span>Matikan Alarm &amp; Mulai Sesi Fokus ({{ timerStore.currentStudyConfig.focusMinutes }}m)</span>
            </button>

            <!-- Tombol Matikan Alarm Saja / Tutup -->
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              @click="timerStore.closeCompletedModal"
            >
              <Icon v-if="timerStore.isAlarmActive" name="lucide:bell-off" class="w-4 h-4 text-stone-500" />
              <span>{{ timerStore.isAlarmActive ? 'Matikan Suara Alarm & Tutup' : 'Tutup Pop-up' }}</span>
            </button>

            <!-- Tautan Gamifikasi / Statistik Progres -->
            <div class="pt-2">
              <NuxtLink
                v-if="authStore.isAuthenticated"
                to="/gamification/stats"
                class="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
                @click="timerStore.closeCompletedModal"
              >
                <span>Lihat Statistik &amp; Progres Streak</span>
                <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
              </NuxtLink>
              <NuxtLink
                v-else
                to="/login"
                class="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
                @click="timerStore.closeCompletedModal"
              >
                <span>Masuk Akun untuk Simpan Streak Belajar</span>
                <Icon name="lucide:arrow-right" class="w-3.5 h-3.5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
