<script setup lang="ts">
import { usePreferencesStore, PERSONALITY_OPTIONS } from '~/stores/preferences'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const preferencesStore = usePreferencesStore()
const selectedPersonality = ref(preferencesStore.activePersonality)
const isSaving = ref(false)
const saveSuccess = ref(false)

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      selectedPersonality.value = preferencesStore.activePersonality
      saveSuccess.value = false
    }
  }
)

const handleSelect = (id: string) => {
  selectedPersonality.value = id
}

const handleSave = async () => {
  isSaving.value = true
  const success = await preferencesStore.updatePersonality(selectedPersonality.value)
  isSaving.value = false
  if (success) {
    saveSuccess.value = true
    setTimeout(() => {
      emit('close')
    }, 600)
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity"
  >
    <div
      class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-400 transform transition-all relative overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-orange-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
            <Icon name="lucide:sparkles" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-xl font-black text-stone-900">
              Personalitas Podo
            </h3>
            <p class="text-xs text-stone-600 font-medium">
              Pilih gaya pendampingan yang paling nyaman untukmu
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          @click="emit('close')"
        >
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Personality Options (No Emojis, strictly Lucide Icons) -->
      <div class="py-5 space-y-3">
        <div
          v-for="opt in PERSONALITY_OPTIONS"
          :key="opt.id"
          class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4"
          :class="
            selectedPersonality === opt.id
              ? 'border-orange-500 bg-orange-50/80 shadow-sm'
              : 'border-stone-200 hover:border-orange-300 bg-white hover:bg-orange-50/30'
          "
          @click="handleSelect(opt.id)"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            :class="
              selectedPersonality === opt.id
                ? 'bg-orange-500 text-white'
                : 'bg-stone-100 text-stone-600'
            "
          >
            <Icon :name="opt.icon" class="w-5 h-5" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-extrabold text-sm text-stone-900">
                {{ opt.label }}
              </h4>
              <div
                v-if="selectedPersonality === opt.id"
                class="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0"
              >
                <Icon name="lucide:check" class="w-3.5 h-3.5" />
              </div>
            </div>
            <p class="text-xs text-stone-600 mt-1 leading-relaxed">
              {{ opt.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-4 border-t border-orange-100 flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
          @click="emit('close')"
        >
          Batal
        </button>

        <button
          type="button"
          class="px-6 py-2.5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          :disabled="isSaving"
          @click="handleSave"
        >
          <Icon v-if="isSaving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <Icon v-else-if="saveSuccess" name="lucide:check" class="w-4 h-4" />
          <Icon v-else name="lucide:save" class="w-4 h-4" />
          <span>{{ saveSuccess ? 'Tersimpan!' : isSaving ? 'Menyimpan...' : 'Terapkan Gaya' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
