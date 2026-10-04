<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const timerStore = useTimerStore()
const authStore = useAuthStore()

// State untuk drawer task
const isTaskDrawerOpen = ref(true)

// Interface Task
interface UserTask {
  id: string
  title: string
  subtitle?: string
  completed: boolean
}

// User by default TANPA tasks, disimpan secara reaktif di localStorage
const tasks = useLocalStorage<UserTask[]>('podofriend_tasks', [])

// Form tambah task
const isAddingTask = ref(false)
const newTaskTitle = ref('')
const newTaskSubtitle = ref('')

// Sinkronisasi active task jika daftar task berubah
watchEffect(() => {
  if (tasks.value.length > 0) {
    const hasCurrentActive = tasks.value.some(t => t.title === timerStore.activeTask)
    if (!hasCurrentActive) {
      const firstPending = tasks.value.find(t => !t.completed) ?? tasks.value[0]
      if (firstPending?.title) {
        timerStore.setActiveTask(firstPending.title)
      }
    }
  } else {
    timerStore.setActiveTask('Fokus Mandiri')
  }
})

const handleAddTask = () => {
  const trimmed = newTaskTitle.value.trim()
  if (!trimmed) return

  const newTask: UserTask = {
    id: Date.now().toString(),
    title: trimmed,
    subtitle: newTaskSubtitle.value.trim() || undefined,
    completed: false,
  }

  tasks.value.push(newTask)
  timerStore.setActiveTask(newTask.title)
  newTaskTitle.value = ''
  newTaskSubtitle.value = ''
  isAddingTask.value = false
}

const selectTask = (taskTitle: string) => {
  timerStore.setActiveTask(taskTitle)
}

const toggleTaskCompletion = (task: UserTask, event: Event) => {
  event.stopPropagation()
  task.completed = !task.completed
}

const deleteTask = (taskId: string, event: Event) => {
  event.stopPropagation()
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  const first = tasks.value[0]
  if (first?.title) {
    timerStore.setActiveTask(first.title)
  } else {
    timerStore.setActiveTask('Fokus Mandiri')
  }
}

const toggleTaskDrawer = () => {
  isTaskDrawerOpen.value = !isTaskDrawerOpen.value
}

import type { MascotAnimationState } from '~/types/mascot'

// Dialog dialog kata-kata Podo
const podoSpeech = computed(() => {
  if (timerStore.isRunning) {
    return 'Hebat! Pertahankan fokusmu ya, jangan buka media sosial dulu!'
  }
  if (timerStore.mode === 'break') {
    return 'Waktunya istirahat sejenak! Regangkan badan dan minum air putih.'
  }
  if (timerStore.timeLeft < timerStore.totalDuration) {
    return 'Timer dijeda. Siap melanjutkan fokus belajarmu lagi?'
  }
  return 'Halo aku Podo, Teman belajar kamu, Mulai!'
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
</script>

<template>
  <div class="relative w-full flex flex-col items-start">
    <!-- Guest Nudge Banner (Only for unauthenticated guests) -->
    <div
      v-if="!authStore.isAuthenticated"
      class="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in"
    >
      <div class="flex items-center gap-3 text-center sm:text-left">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Icon name="lucide:sparkles" class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="font-extrabold text-sm sm:text-base">
            Login untuk menyimpan sesi belajar dan berinteraksi dengan AI Companion!
          </p>
          <p class="text-xs text-orange-100">
            Sesi timer saat ini berjalan secara lokal dan tidak tersimpan ke riwayat akun.
          </p>
        </div>
      </div>
      <NuxtLink
        to="/login"
        class="shrink-0 px-5 py-2.5 rounded-full bg-white text-orange-600 font-extrabold text-sm hover:bg-orange-50 shadow transition-transform hover:scale-105"
      >
        Masuk Sekarang →
      </NuxtLink>
    </div>

    <!-- Streak Alert Banner (Figma #44:680) -->
    <div
      class="mb-6 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FFC9A8] border border-orange-300 shadow-sm"
    >
      <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
        <Icon name="lucide:flame" class="w-5 h-5 text-orange-500" />
      </div>
      <span class="text-xs sm:text-sm font-extrabold text-stone-800">
        {{ authStore.isAuthenticated ? 'Kamu membuka Streak Belajar!' : 'Mode Tamu: Coba Pomodoro Timer!' }}
      </span>
    </div>

    <!-- Main Container with Task Drawer on Left and Timer on Center -->
    <div class="w-full flex flex-col lg:flex-row items-start justify-start gap-6 lg:gap-8 relative z-10">
      <!-- Task Drawer (Figma #45:789 My Task) -->
      <div
        class="w-full lg:w-80 shrink-0 bg-white rounded-3xl border-2 border-orange-200 shadow-md overflow-hidden transition-all duration-300"
      >
        <!-- Header -->
        <div class="bg-orange-500 p-4 px-5 flex items-center justify-between text-white">
          <div class="flex items-center gap-2">
            <Icon name="lucide:check-square" class="w-5 h-5 text-white" />
            <h3 class="font-black text-lg">My Task</h3>
            <span
              v-if="tasks.length > 0"
              class="text-[11px] font-extrabold bg-white/25 px-2 py-0.5 rounded-full"
            >
              {{ tasks.filter(t => t.completed).length }}/{{ tasks.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-xs font-bold bg-white text-orange-600 hover:bg-orange-50 px-2.5 py-1 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Tambah Task Baru"
              @click="isAddingTask = !isAddingTask"
            >
              <Icon :name="isAddingTask ? 'lucide:x' : 'lucide:plus'" class="w-3.5 h-3.5" />
              <span>{{ isAddingTask ? 'Tutup' : 'Tambah' }}</span>
            </button>
            <button
              type="button"
              class="lg:hidden text-white/80 hover:text-white p-1 cursor-pointer"
              @click="toggleTaskDrawer"
            >
              <Icon :name="isTaskDrawerOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-show="isTaskDrawerOpen" class="flex flex-col">
          <!-- Form Tambah Task Baru -->
          <div
            v-if="isAddingTask"
            class="p-3 bg-orange-50/80 border-b border-orange-200 flex flex-col gap-2"
          >
            <input
              v-model="newTaskTitle"
              type="text"
              placeholder="Target belajar (mis: Belajar Python)..."
              class="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              @keydown.enter="handleAddTask"
            />
            <input
              v-model="newTaskSubtitle"
              type="text"
              placeholder="Catatan / materi (opsional)..."
              class="w-full text-[11px] px-3 py-1.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-700"
              @keydown.enter="handleAddTask"
            />
            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-500 hover:bg-stone-200/60 cursor-pointer"
                @click="isAddingTask = false"
              >
                Batal
              </button>
              <button
                type="button"
                :disabled="!newTaskTitle.trim()"
                class="px-3 py-1 rounded-lg text-[11px] font-extrabold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 cursor-pointer shadow-xs"
                @click="handleAddTask"
              >
                Simpan Task
              </button>
            </div>
          </div>

          <!-- Empty State (User by default tanpa task) -->
          <div
            v-if="tasks.length === 0 && !isAddingTask"
            class="p-6 text-center flex flex-col items-center justify-center gap-2"
          >
            <div class="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mb-1">
              <Icon name="lucide:clipboard-list" class="w-6 h-6" />
            </div>
            <p class="text-xs font-extrabold text-stone-800">
              Belum ada target task
            </p>
            <p class="text-[11px] text-stone-500 max-w-[200px]">
              Tambahkan tugas belajarmu hari ini agar sesi Pomodoro lebih terarah.
            </p>
            <button
              type="button"
              class="mt-2 text-xs font-extrabold text-orange-600 bg-orange-100 hover:bg-orange-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              @click="isAddingTask = true"
            >
              <Icon name="lucide:plus-circle" class="w-4 h-4" />
              <span>Tambah Task Pertama</span>
            </button>
          </div>

          <!-- Task List (Diambil dari localStorage) -->
          <div v-else class="p-2 divide-y divide-orange-100 max-h-72 overflow-y-auto">
            <div
              v-for="t in tasks"
              :key="t.id"
              class="w-full p-2.5 rounded-2xl text-left transition-colors flex items-center justify-between gap-2.5 group cursor-pointer"
              :class="timerStore.activeTask === t.title ? 'bg-orange-100/70 border border-orange-300' : 'hover:bg-orange-50/70'"
              @click="selectTask(t.title)"
            >
              <!-- Checkbox Completion -->
              <button
                type="button"
                class="shrink-0 p-1 text-stone-400 hover:text-orange-600 transition-colors cursor-pointer"
                title="Tandai selesai"
                @click="toggleTaskCompletion(t, $event)"
              >
                <Icon
                  :name="t.completed ? 'lucide:check-circle-2' : 'lucide:circle'"
                  :class="t.completed ? 'text-emerald-500' : 'text-stone-300 group-hover:text-orange-400'"
                  class="w-5 h-5"
                />
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-xs font-bold truncate"
                  :class="t.completed ? 'line-through text-stone-400 font-medium' : 'text-stone-900'"
                >
                  {{ t.title }}
                </p>
                <p v-if="t.subtitle" class="text-[10px] text-stone-500 line-clamp-1">
                  {{ t.subtitle }}
                </p>
              </div>

              <!-- Delete Button -->
              <button
                type="button"
                class="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                title="Hapus task"
                @click="deleteTask(t.id, $event)"
              >
                <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Active Task Indicator -->
          <div class="p-3 bg-orange-50/50 border-t border-orange-100 text-xs text-stone-600 flex items-center justify-between">
            <span class="font-medium">Fokus saat ini:</span>
            <span class="font-bold text-orange-600 truncate max-w-[150px]">{{ timerStore.activeTask }}</span>
          </div>
        </div>
      </div>

      <!-- Center Timer Stage (Figma #47:1015) -->
      <div
        class="flex-1 w-full max-w-4xl flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-orange-400 p-6 sm:p-10 shadow-lg relative overflow-hidden"
      >
        <!-- Mode Switcher (Work vs Break) -->
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-orange-100/80 mb-6">
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer"
            :class="timerStore.mode === 'work' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600'"
            @click="timerStore.setDuration(25, 'work')"
          >
            🎯 Mode Fokus (25m)
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer"
            :class="timerStore.mode === 'break' ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-700 hover:text-orange-600'"
            @click="timerStore.setDuration(5, 'break')"
          >
            ☕ Istirahat (5m)
          </button>
        </div>

        <!-- Timer Big Numbers (Figma #44:668: 120px Inter Extra Bold) -->
        <div class="py-4 select-none text-center">
          <span
            class="text-7xl sm:text-9xl md:text-[130px] font-black text-stone-900 tracking-tight leading-none font-mono"
          >
            {{ timerStore.formattedTime }}
          </span>
        </div>

        <!-- Control Row Buttons (Figma #44:673) -->
        <div class="flex items-center justify-center gap-4 sm:gap-8 my-6">
          <!-- Reset Button (#44:674) -->
          <button
            type="button"
            aria-label="Reset Timer"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all cursor-pointer border border-orange-300"
            @click="timerStore.reset"
          >
            <Icon name="lucide:rotate-ccw" class="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          <!-- Play / Pause Button (#44:676: Orange, thick black border & shadow) -->
          <button
            type="button"
            aria-label="Mulai atau Jeda Timer"
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-orange-500 border-4 sm:border-8 border-stone-900 text-white flex items-center justify-center shadow-[0_6px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none hover:bg-orange-600 transition-all cursor-pointer group"
            @click="timerStore.isRunning ? timerStore.pause() : timerStore.start()"
          >
            <Icon
              :name="timerStore.isRunning ? 'lucide:pause' : 'lucide:play'"
              class="w-9 h-9 sm:w-11 sm:h-11 text-white group-hover:scale-110 transition-transform"
            />
          </button>

          <!-- Skip / Next Button (#44:678) -->
          <button
            type="button"
            aria-label="Lewati Sesi"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-200/50 hover:bg-orange-200/80 active:scale-95 text-stone-700 flex items-center justify-center shadow-xs transition-all cursor-pointer border border-orange-300"
            @click="timerStore.skip"
          >
            <Icon name="lucide:fast-forward" class="w-7 h-7 sm:w-8 sm:h-8" />
          </button>
        </div>

        <!-- Big 'Selesai Sesi' CTA Button (Figma #45:974) -->
        <div class="w-full max-w-sm my-2">
          <button
            type="button"
            class="w-full py-4 px-6 rounded-2xl bg-[#FFC9A8] hover:bg-[#ffb68c] active:scale-[0.98] border border-orange-300 text-[#7D614F] font-black text-xl sm:text-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 transition-all cursor-pointer"
            @click="timerStore.completeSession"
          >
            <Icon name="lucide:check-circle" class="w-6 h-6 sm:w-7 sm:h-7 text-[#7D614F]" />
            <span>Selesai Sesi</span>
          </button>
        </div>

        <!-- Mascot with Speech Bubble (Figma #44:672) -->
        <div class="mt-8 pt-6 border-t border-orange-100 w-full flex items-center justify-center gap-4 sm:gap-6">
          <div class="w-16 h-16 sm:w-24 sm:h-24 shrink-0 transition-transform hover:scale-105">
            <AppMascot
              size="custom"
              custom-class="w-16 h-16 sm:w-24 sm:h-24"
              :animation="companionMascotAnimation"
            />
          </div>

          <!-- Speech bubble with arrow -->
          <div
            class="relative bg-orange-100/80 border border-orange-200 rounded-2xl p-3.5 sm:p-4 text-stone-800 text-xs sm:text-sm font-semibold max-w-md shadow-xs"
          >
            <!-- Bubble triangle arrow -->
            <div
              class="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-200 border-b-8 border-b-transparent"
            />
            <p>{{ podoSpeech }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Completed Celebration Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="timerStore.isCompletedModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
      >
        <div
          class="bg-white rounded-3xl border-2 border-orange-400 p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
        >
          <div class="w-24 h-24 mx-auto flex items-center justify-center mb-4">
            <AppMascot size="lg" animation="excited" />
          </div>

          <h3 class="text-2xl font-black text-stone-900 mb-1">
            Sesi Belajar Selesai! 🎉
          </h3>
          <p class="text-sm text-stone-600 mb-6">
            Kamu berhasil menyelesaikan fokus selama
            <span class="font-extrabold text-orange-600">{{ timerStore.completedDurationMinutes }} menit</span>.
            {{ authStore.isAuthenticated ? 'Data sesi dan streak berhasil disimpan!' : 'Login untuk mencatat streak dan total waktumu!' }}
          </p>

          <div class="flex flex-col gap-3">
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/gamification/stats"
              class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow transition-all"
              @click="timerStore.closeCompletedModal"
            >
              Lihat Statistik &amp; Progres →
            </NuxtLink>
            <NuxtLink
              v-else
              to="/login"
              class="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow transition-all"
              @click="timerStore.closeCompletedModal"
            >
              Masuk Sekarang →
            </NuxtLink>
            <button
              type="button"
              class="w-full py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors cursor-pointer"
              @click="timerStore.closeCompletedModal"
            >
              Mulai Sesi Baru
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
