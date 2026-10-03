<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
    case 'outline':
      return 'bg-transparent text-orange-600 border-2 border-orange-500 hover:bg-orange-50'
    case 'ghost':
      return 'bg-transparent text-stone-700 hover:bg-orange-100/60'
    case 'primary':
    default:
      return 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-4 py-2 text-xs'
    case 'lg':
      return 'px-7 py-3.5 text-base'
    case 'md':
    default:
      return 'px-5 py-2.5 text-sm'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
      (disabled || loading) ? 'opacity-60 cursor-not-allowed active:scale-100' : 'cursor-pointer',
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
