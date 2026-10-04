<script setup lang="ts">
import type { MascotAnimationState } from '~/types/mascot'
import { moteSvg as idleSvg } from '~~/.agent/docs/mote.js'
import { moteSvg as excitedSvg } from '~~/.agent/docs/Animation/moteExcited.js'
import { moteSvg as listeningSvg } from '~~/.agent/docs/Animation/moteListening.js'
import { moteSvg as searchingSvg } from '~~/.agent/docs/Animation/moteSearching.js'
import { moteSvg as sleepySvg } from '~~/.agent/docs/Animation/moteSleepy.js'
import { moteSvg as thinkingSvg } from '~~/.agent/docs/Animation/moteThinking.js'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  customClass?: string
  animation?: MascotAnimationState
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  customClass: '',
  animation: 'idle',
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-12 h-12'
    case 'lg':
      return 'w-36 h-36'
    case 'xl':
      return 'w-48 h-48'
    case 'custom':
      return props.customClass
    case 'md':
    default:
      return 'w-24 h-24'
  }
})

const svgMap: Record<MascotAnimationState, string> = {
  idle: idleSvg,
  thinking: thinkingSvg,
  listening: listeningSvg,
  excited: excitedSvg,
  sleepy: sleepySvg,
  searching: searchingSvg,
}

const currentSvg = computed(() => {
  return svgMap[props.animation] || idleSvg
})
</script>

<template>
  <div
    :class="['relative inline-flex items-center justify-center select-none overflow-hidden', sizeClass]"
  >
    <Transition name="mascot-morph" mode="out-in">
      <div
        :key="animation"
        class="w-full h-full flex items-center justify-center pointer-events-none"
        v-html="currentSvg"
      />
    </Transition>
  </div>
</template>

<style scoped>
:deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.mascot-morph-enter-active,
.mascot-morph-leave-active {
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.mascot-morph-enter-from {
  opacity: 0;
  transform: scale(0.88);
}

.mascot-morph-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
