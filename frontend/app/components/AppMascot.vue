<script setup lang="ts">
import { moteSvg } from '~~/.agent/docs/mote.js'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  customClass: '',
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
</script>

<template>
  <div
    :class="['inline-flex items-center justify-center transition-transform select-none', sizeClass]"
    v-html="moteSvg"
  />
</template>

<style scoped>
:deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
