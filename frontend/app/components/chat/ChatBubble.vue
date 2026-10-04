<script setup lang="ts">
import type { ChatMessage } from '~/types/chat'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

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
</script>

<template>
  <div
    class="flex w-full mb-4 items-end gap-2.5 transition-all"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- Avatar Mascot for AI Message (Wajib AppMascot berukuran kecil) -->
    <div
      v-if="!isUser"
      class="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1 rounded-2xl bg-orange-100 border border-orange-200 select-none shadow-sm"
    >
      <AppMascot size="sm" />
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
      <!-- Message Content -->
      <div class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-medium">
        {{ message.message }}
      </div>

      <!-- Timestamp -->
      <div
        v-if="formattedTime"
        class="mt-1.5 flex items-center gap-1 text-[10px]"
        :class="isUser ? 'text-orange-100 justify-end' : 'text-stone-400 justify-start'"
      >
        <Icon name="lucide:clock" class="w-3 h-3 opacity-70" />
        <span>{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>
