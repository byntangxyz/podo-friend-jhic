<script setup lang="ts">
const chatStore = useChatStore()
const typingAnimation = computed(() => {
  return chatStore.mascotState === 'searching' ? 'searching' : 'thinking'
})
</script>

<template>
  <div class="flex w-full mb-4 items-end gap-2.5 justify-start transition-all">
    <!-- Avatar Mascot for AI -->
    <div
      class="w-16 h-16 flex-shrink-0 flex items-center justify-center p-1 select-none transition-all"
    >
      <AppMascot size="custom" custom-class="w-16 h-16 sm:w-16 sm:h-16" :animation="typingAnimation" />
    </div>

    <!-- Typing Bubble -->
    <div
      class="rounded-2xl rounded-tl-xs px-5 py-3.5 bg-gray-100 border border-stone-200/80 shadow-sm flex items-center gap-1.5"
    >
      <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0ms;" />
      <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 150ms;" />
      <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 300ms;" />
    </div>
  </div>
</template>
