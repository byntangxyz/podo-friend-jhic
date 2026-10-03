<script setup lang="ts">
interface Props {
  as?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
  variant?: 'white' | 'cream'
}

withDefaults(defineProps<Props>(), {
  as: 'div',
  padding: 'md',
  variant: 'white',
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'rounded-3xl border-2 border-orange-500 shadow-md transition-shadow relative overflow-hidden',
      variant === 'white' ? 'bg-white' : 'bg-orange-50',
      padding === 'none' ? 'p-0' : '',
      padding === 'sm' ? 'p-4 sm:p-5' : '',
      padding === 'md' ? 'p-6 sm:p-8' : '',
      padding === 'lg' ? 'p-8 sm:p-10' : '',
    ]"
  >
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </component>
</template>
