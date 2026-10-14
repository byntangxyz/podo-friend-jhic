<script setup lang="ts">
import type { ParsedChatAction } from '~/utils/chatActions'
import { useTimerStore, STUDY_MODES, type StudyModeKey } from '~/stores/timer'
import { useTaskStore } from '~/stores/task'

interface Props {
  action: ParsedChatAction
}

const props = defineProps<Props>()

const timerStore = useTimerStore()
const taskStore = useTaskStore()

const isApplying = ref(false)
const justApplied = ref(false)

// Mode Study
const modeConfig = computed(() => {
  if (props.action.type !== 'SET_STUDY_MODE') return null
  return STUDY_MODES[props.action.mode as StudyModeKey] || STUDY_MODES.normal
})

const isCurrentStudyMode = computed(() => {
  if (props.action.type !== 'SET_STUDY_MODE') return false
  return timerStore.studyMode === props.action.mode
})

const applyStudyMode = () => {
  if (props.action.type !== 'SET_STUDY_MODE') return
  isApplying.value = true
  timerStore.setStudyMode(props.action.mode)
  justApplied.value = true
  setTimeout(() => {
    isApplying.value = false
  }, 400)
}

// Task Creation
const isTaskAlreadyExists = computed(() => {
  if (props.action.type !== 'CREATE_TASK') return false
  const target = props.action.title.toLowerCase().trim()
  return taskStore.tasks.some((t) => t.title.toLowerCase().trim() === target)
})

const taskErrorMessage = ref<string | null>(null)

const applyCreateTask = async () => {
  if (props.action.type !== 'CREATE_TASK') return
  isApplying.value = true
  taskErrorMessage.value = null
  try {
    const created = await taskStore.addTask(props.action.title)
    if (created) {
      justApplied.value = true
    } else {
      taskErrorMessage.value = taskStore.error || 'Gagal menambahkan tugas ke My Task'
    }
  } catch (err: any) {
    taskErrorMessage.value = err?.message || 'Terjadi kesalahan saat menambahkan tugas'
  } finally {
    isApplying.value = false
  }
}
</script>

<template>
  <div class="mt-3 pt-3 border-t border-stone-200/90 text-stone-900 select-none">
    <!-- 1. Aksi Rekomendasi Mode Belajar Timer -->
    <div
      v-if="action.type === 'SET_STUDY_MODE' && modeConfig"
      class="bg-white/90 rounded-xl p-3 border border-orange-200 shadow-xs flex flex-col gap-2"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
            <Icon name="lucide:timer" class="w-4 h-4" />
          </div>
          <div>
            <div class="text-xs font-bold text-stone-800">
              Rekomendasi Mode: {{ modeConfig.label }}
            </div>
            <div class="text-[11px] text-stone-500 font-medium">
              {{ modeConfig.focusMinutes }}m Fokus &bull; {{ modeConfig.breakMinutes }}m Istirahat
            </div>
          </div>
        </div>

        <span
          v-if="isCurrentStudyMode || justApplied"
          class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
        >
          <Icon name="lucide:check" class="w-3 h-3" /> Aktif
        </span>
      </div>

      <div v-if="action.reason" class="text-[11px] text-stone-600 italic bg-orange-50/50 rounded-lg p-1.5">
        "{{ action.reason }}"
      </div>

      <button
        v-if="!isCurrentStudyMode && !justApplied"
        type="button"
        :disabled="isApplying"
        class="w-full mt-1 py-1.5 px-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
        @click="applyStudyMode"
      >
        <Icon v-if="isApplying" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
        <Icon v-else name="lucide:zap" class="w-3.5 h-3.5" />
        <span>{{ isApplying ? 'Menerapkan...' : 'Terapkan ke Timer Sekarang' }}</span>
      </button>
    </div>

    <!-- 2. Aksi Tambah Tugas Baru ke My Task -->
    <div
      v-else-if="action.type === 'CREATE_TASK'"
      class="bg-white/90 rounded-xl p-3 border border-orange-200 shadow-xs flex flex-col gap-2"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-start gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0 mt-0.5">
            <Icon name="lucide:check-square" class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Usulan Tugas Baru
            </div>
            <div class="text-xs font-bold text-stone-800 leading-snug">
              {{ action.title }}
            </div>
          </div>
        </div>

        <span
          v-if="isTaskAlreadyExists || justApplied"
          class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0"
        >
          <Icon name="lucide:check" class="w-3 h-3" /> Ada di My Task
        </span>
      </div>

      <button
        v-if="!isTaskAlreadyExists && !justApplied"
        type="button"
        :disabled="isApplying"
        class="w-full mt-1 py-1.5 px-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
        @click="applyCreateTask"
      >
        <Icon v-if="isApplying" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
        <Icon v-else name="lucide:plus" class="w-3.5 h-3.5" />
        <span>{{ isApplying ? 'Menambahkan...' : 'Tambah ke Daftar Tugasku' }}</span>
      </button>

      <div
        v-if="taskErrorMessage"
        class="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 font-medium flex items-center gap-1.5 mt-1"
      >
        <Icon name="lucide:alert-circle" class="w-3.5 h-3.5 text-red-500 shrink-0" />
        <span>{{ taskErrorMessage }}</span>
      </div>
    </div>
  </div>
</template>
