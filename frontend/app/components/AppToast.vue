<script setup lang="ts">
const { isVisible, message, hideToast } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-8 opacity-0 scale-95"
    enter-to-class="translate-y-0 opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100 scale-100"
    leave-to-class="-translate-y-6 opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed top-8 sm:top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto px-4 w-auto max-w-[90vw]"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex items-center gap-3 px-5 sm:px-6 py-2.5 rounded-full bg-[#FFF7ED] border-2 border-orange-300 shadow-xl text-stone-900 backdrop-blur-sm"
      >
        <div class="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center shrink-0 shadow-xs">
          <Icon name="lucide:flame" class="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
        </div>
        <span class="text-xs sm:text-sm font-black text-stone-800 truncate max-w-xs sm:max-w-md">
          {{ message }}
        </span>
        <button
          type="button"
          class="ml-1 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors cursor-pointer"
          title="Tutup notifikasi"
          @click="hideToast"
        >
          <Icon name="lucide:x" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </Transition>
</template>
