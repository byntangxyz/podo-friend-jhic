<script setup lang="ts">
const taskStore = useTaskStore()
const timerStore = useTimerStore()

const newTaskTitle = ref('')

onMounted(async () => {
  if (taskStore.tasks.length === 0) {
    await taskStore.fetchTasks()
  }
})

const handleAddTask = async () => {
  const title = newTaskTitle.value.trim()
  if (!title || taskStore.isSubmitting) return

  const created = await taskStore.addTask(title)
  if (created) {
    newTaskTitle.value = ''
    timerStore.setActiveTask(created.title)
  }
}

const toggleTaskCompletion = async (taskId: string, event?: Event) => {
  if (event) event.stopPropagation()
  await taskStore.toggleTask(taskId)
}

const deleteTask = async (taskId: string, event?: Event) => {
  if (event) event.stopPropagation()
  await taskStore.deleteTask(taskId)
}

const selectTask = (taskTitle: string) => {
  timerStore.setActiveTask(taskTitle)
}
</script>

<template>
  <BaseCard
    variant="white"
    padding="none"
    class="w-full bg-white rounded-3xl border-2 border-orange-200 shadow-md overflow-hidden transition-all duration-300"
  >
    <!-- Header: Orange block tajuk "My Task" -->
    <div class="bg-orange-500 p-4 px-5 flex items-center justify-between text-white">
      <div class="flex items-center gap-2">
        <Icon name="lucide:check-square" class="w-5 h-5 text-white" />
        <h3 class="font-black text-lg">My Task</h3>
        <span
          v-if="taskStore.totalCount > 0"
          class="text-[11px] font-extrabold bg-white/25 px-2 py-0.5 rounded-full"
        >
          {{ taskStore.completedCount }}/{{ taskStore.totalCount }}
        </span>
      </div>
    </div>

    <!-- Input Form Tambah Task Baru -->
    <div class="p-3 bg-orange-50/70 border-b border-orange-200 flex items-center gap-2">
      <input
        v-model="newTaskTitle"
        type="text"
        placeholder="Target belajar baru..."
        class="flex-1 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900 placeholder:text-stone-400"
        :disabled="taskStore.isSubmitting"
        @keydown.enter="handleAddTask"
      />
      <button
        type="button"
        :disabled="!newTaskTitle.trim() || taskStore.isSubmitting"
        class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
        @click="handleAddTask"
      >
        <Icon v-if="taskStore.isSubmitting" name="lucide:loader-2" class="w-3.5 h-3.5 animate-spin" />
        <Icon v-else name="lucide:plus" class="w-3.5 h-3.5" />
        <span>Tambah</span>
      </button>
    </div>

    <!-- Body: Task List Content -->
    <div class="flex flex-col">
      <!-- Loading State -->
      <div
        v-if="taskStore.isLoading"
        class="p-6 text-center flex flex-col items-center justify-center gap-2"
      >
        <Icon name="lucide:loader-2" class="w-6 h-6 text-orange-500 animate-spin" />
        <span class="text-xs text-stone-500 font-medium">Memuat daftar tugas...</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="taskStore.tasks.length === 0"
        class="p-6 text-center flex flex-col items-center justify-center gap-2"
      >
        <div class="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mb-1">
          <Icon name="lucide:clipboard-list" class="w-6 h-6" />
        </div>
        <p class="text-xs font-extrabold text-stone-800">
          Belum ada target tugas
        </p>
        <p class="text-[11px] text-stone-500 max-w-[200px]">
          Tulis tugas belajarmu di atas agar sesi Pomodoro lebih terarah.
        </p>
      </div>

      <!-- Task List Items -->
      <div v-else class="p-2 divide-y divide-orange-100 max-h-72 overflow-y-auto">
        <div
          v-for="t in taskStore.sortedTasks"
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
            @click="toggleTaskCompletion(t.id, $event)"
          >
            <Icon
              :name="t.is_completed ? 'lucide:check-circle-2' : 'lucide:circle'"
              :class="t.is_completed ? 'text-emerald-500' : 'text-stone-300 group-hover:text-orange-400'"
              class="w-5 h-5"
            />
          </button>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p
              class="text-xs font-bold truncate"
              :class="t.is_completed ? 'line-through text-stone-400 font-medium' : 'text-stone-900'"
            >
              {{ t.title }}
            </p>
          </div>

          <!-- Delete Button (Hover) -->
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

      <!-- Active Task Indicator Footer -->
      <div class="p-3 bg-orange-50/50 border-t border-orange-100 text-xs text-stone-600 flex items-center justify-between">
        <span class="font-medium">Fokus saat ini:</span>
        <span class="font-bold text-orange-600 truncate max-w-[150px]">{{ timerStore.activeTask }}</span>
      </div>
    </div>
  </BaseCard>
</template>
