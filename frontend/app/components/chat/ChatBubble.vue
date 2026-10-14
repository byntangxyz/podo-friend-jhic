<script setup lang="ts">
import type { ChatMessage } from '~/types/chat'

import { parseChatAction } from '~/utils/chatActions'
import ChatActionCard from './ChatActionCard.vue'

interface Props {
  message: ChatMessage
  isLatestAi?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLatestAi: false,
})

const chatStore = useChatStore()

const parsedMessage = computed(() => {
  return parseChatAction(props.message.message)
})

const formattedTime = computed(() => {
  if (!props.message.created_at) return ''
  try {
    const d = new Date(props.message.created_at)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
})

const isUser = computed(() => props.message.sender === 'user')

const aiAvatarAnimation = computed(() => {
  if (!props.message.message || chatStore.isLoading) {
    return 'thinking'
  }
  if (chatStore.mascotState === 'excited') {
    return 'excited'
  }
  return 'idle'
})
</script>

<template>
  <div
    class="flex w-full mb-4 items-end gap-2.5 transition-all"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar Mascot for AI Message: HANYA untuk pesan AI terbaru agar layar hanya memuat 1 maskot di area chat -->
    <div
      v-if="!isUser"
      class="w-16 h-16 flex-shrink-0 flex items-center justify-center p-1  select-none transition-all"
      :class="isLatestAi ? '' : 'invisible pointer-events-none'"
    >
      <AppMascot
        v-if="isLatestAi"
        size="custom"
        custom-class="w-16 h-16 sm:w-16 sm:h-16"
        :animation="aiAvatarAnimation"
      />
    </div>

    <!-- Bubble Container -->
    <div
      class="max-w-[85%] sm:max-w-[75%] md:max-w-[68%] rounded-2xl px-5 py-3.5 shadow-sm transition-all"
      :class="
        isUser
          ? 'bg-orange-500 text-white rounded-tr-xs'
          : 'bg-gray-100 text-stone-900 border border-stone-200/80 rounded-tl-xs'
      "
    >
      <!-- Message Content (Jika sudah ada teks) -->
      <div
        v-if="parsedMessage.cleanText"
        class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-medium"
      >
        {{ parsedMessage.cleanText }}
      </div>

      <!-- Action Cards interaktif jika AI menyertakan aksi terstruktur (bisa lebih dari satu, misal: mode + task) -->
      <template v-if="!isUser && parsedMessage.actions && parsedMessage.actions.length > 0">
        <ChatActionCard
          v-for="(act, idx) in parsedMessage.actions"
          :key="idx"
          :action="act"
        />
      </template>

      <!-- Typing Indicator In-Place (HANYA saat pesan AI masih kosong sebelum teks chunk pertama tiba) -->
      <div
        v-if="!isUser && !parsedMessage.cleanText"
        class="flex items-center gap-1.5 py-1 px-0.5"
      >
        <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0ms;" />
        <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 150ms;" />
        <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 300ms;" />
      </div>

      <!-- Timestamp -->
      <div
        v-if="formattedTime"
        class="mt-1 text-[10px] text-right font-bold opacity-75"
        :class="isUser ? 'text-white/80' : 'text-stone-500'"
      >
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>
