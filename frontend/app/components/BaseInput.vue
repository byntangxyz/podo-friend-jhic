<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  id?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
  hint: '',
  autocomplete: 'off',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substring(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="label"
      :for="inputId"
      class="text-xs sm:text-sm font-bold text-stone-800 flex items-center justify-between"
    >
      <span>
        {{ label }}
        <span v-if="required" class="text-orange-500">*</span>
      </span>
      <span v-if="hint" class="text-xs font-normal text-stone-400">{{ hint }}</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="[
          'w-full px-4 py-3 rounded-xl text-stone-900 bg-white placeholder-stone-400 text-sm transition-all duration-150',
          'border outline-none',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
            : 'border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-100',
          disabled ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : '',
        ]"
        @input="handleInput"
      >
    </div>

    <!-- Error message display -->
    <p
      v-if="error"
      class="text-xs font-medium text-rose-600 flex items-center gap-1 mt-0.5"
    >
      <svg
        class="w-3.5 h-3.5 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </p>
  </div>
</template>
