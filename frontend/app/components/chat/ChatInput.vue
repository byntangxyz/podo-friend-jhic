<script setup lang="ts">
interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const chatStore = useChatStore()
const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !props.isLoading
})

const handleFocus = () => {
  if (!props.isLoading && chatStore.mascotState === 'idle') {
    chatStore.setMascotState('listening')
  }
}

const handleBlur = () => {
  if (!props.isLoading && chatStore.mascotState === 'listening' && !inputText.value.trim()) {
    chatStore.setMascotState('idle')
  }
}

const handleSend = () => {
  if (!canSend.value) return
  const text = inputText.value.trim()
  inputText.value = ''
  chatStore.setMascotState('thinking')
  emit('send', text)
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleInput = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const newHeight = Math.min(textareaRef.value.scrollHeight, 120)
    textareaRef.value.style.height = `${newHeight}px`
  }
  if (!props.isLoading && chatStore.mascotState !== 'listening') {
    chatStore.setMascotState('listening')
  }
}

const quickPrompts = [
  { label: 'Beri tips fokus 25 menit', icon: 'lucide:target' },
  { label: 'Aku merasa lelah dan burnout', icon: 'lucide:battery-low' },
  { label: 'Bagaimana cara rileks saat jeda istirahat?', icon: 'lucide:coffee' },
]

const sendQuickPrompt = (prompt: string) => {
  if (props.isLoading) return
  emit('send', prompt)
}
</script>

<template>
  <div class="w-full space-y-3">
    <!-- Quick Suggestion Pills (No emojis, strictly Lucide icons) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
      <button
        v-for="(item, idx) in quickPrompts"
        :key="idx"
        type="button"
        class="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-stone-800 border border-orange-200 hover:border-orange-400 font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
        :disabled="isLoading"
        @click="sendQuickPrompt(item.label)"
      >
        <Icon :name="item.icon" class="w-3.5 h-3.5 text-orange-600" />
        <span>{{ item.label }}</span>
      </button>
    </div>

    <!-- Input Section with Companion Mascot (Mascot #2) -->
    <div class="flex items-center gap-2.5 sm:gap-3.5 w-full">
      <!-- Companion Mascot Beside Chat Input Bar -->
      <div
        class="w-24 h-24 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center shadow-sm transition-all hover:scale-105 select-none"
        :title="`Status Podo: ${chatStore.mascotState}`"
      >
        <AppMascot
          size="custom"
          custom-class="w-24 h-24 sm:w-24 sm:h-24"
          :animation="chatStore.mascotState"
        />
      </div>

      <!-- Main Input Bar (Figma #58:181 Style) -->
      <div
        class="flex-1 relative flex items-center bg-white rounded-3xl sm:rounded-full border-2 border-orange-300 focus-within:border-orange-500 shadow-md transition-all p-2 pl-5"
      >
        <textarea
          ref="textareaRef"
          v-model="inputText"
          rows="1"
          placeholder="Tanya PodoFriend....."
          class="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 text-sm sm:text-base font-medium resize-none focus:outline-none max-h-28 py-1.5 leading-relaxed"
          :disabled="isLoading"
          @keydown="handleKeydown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />

        <!-- Send Button -->
        <button
          type="button"
          class="ml-2 w-11 h-11 rounded-full bg-[#F56A16] hover:bg-orange-600 disabled:bg-stone-300 text-white flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          :disabled="!canSend"
          title="Kirim pesan"
          @click="handleSend"
        >
          <Icon
            v-if="isLoading"
            name="lucide:loader-2"
            class="w-5 h-5 animate-spin text-white"
          />
          <Icon
            v-else
            name="lucide:send"
            class="w-5 h-5 text-white translate-x-0.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>
