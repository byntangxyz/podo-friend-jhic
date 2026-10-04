<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { usePreferencesStore } from '~/stores/preferences'

interface Props {
  isOpenMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpenMobile: false,
})

const emit = defineEmits<{
  (e: 'closeMobile'): void
  (e: 'openPersonality'): void
  (e: 'newChat'): void
}>()

const chatStore = useChatStore()
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()

const showSearchInput = ref(false)

const handleNewChat = () => {
  chatStore.clearChatLocally()
  emit('newChat')
  emit('closeMobile')
}

const toggleSearch = () => {
  showSearchInput.value = !showSearchInput.value
  if (!showSearchInput.value) {
    chatStore.setSearchQuery('')
  }
}
</script>

<template>
  <aside
    class="w-[320px] lg:w-[350px] flex-shrink-0 bg-[#FBBE97] flex flex-col justify-between p-6 shadow-md border-r border-orange-300/50 transition-all z-30 h-full overflow-y-auto"
  >
    <!-- Top Area: Brand & Actions -->
    <div class="space-y-6">
      <!-- Brand Header (Figma #58:132) -->
      <div class="flex items-center justify-between pb-2 border-b border-orange-300/60">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 flex items-center justify-center">
            <AppMascot size="sm" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-stone-900 tracking-tight leading-none">
              PodoChat!
            </h1>
            <p class="text-xs font-bold text-orange-950/70 mt-1">
              AI Study Companion
            </p>
          </div>
        </div>

        <!-- Mobile Close Button -->
        <button
          type="button"
          class="lg:hidden p-2 rounded-full hover:bg-orange-300/60 text-stone-800"
          @click="emit('closeMobile')"
        >
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Action Pill Buttons (Figma #58:122, #58:141, #58:150) -->
      <div class="space-y-3">
        <!-- Button: Obrolan Baru -->
        <button
          type="button"
          class="w-full h-12 px-5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
          @click="handleNewChat"
        >
          <Icon name="lucide:plus-circle" class="w-5 h-5 text-white" />
          <span>Obrolan baru</span>
        </button>

        <!-- Button / Input: Cari Obrolan -->
        <div>
          <button
            v-if="!showSearchInput"
            type="button"
            class="w-full h-12 px-5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
            @click="toggleSearch"
          >
            <Icon name="lucide:search" class="w-4 h-4 text-white" />
            <span>Cari obrolan</span>
          </button>

          <!-- Active Search Input Field -->
          <div v-else class="relative">
            <input
              v-model="chatStore.searchQuery"
              type="text"
              placeholder="Ketik kata kunci..."
              class="w-full h-12 pl-10 pr-10 rounded-full bg-white text-stone-900 text-sm font-medium border-2 border-orange-400 focus:outline-none focus:border-orange-600 shadow-sm"
              autofocus
            />
            <Icon
              name="lucide:search"
              class="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              @click="toggleSearch"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Button: Personalitas -->
        <button
          type="button"
          class="w-full h-12 px-5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between active:scale-95 cursor-pointer"
          @click="emit('openPersonality')"
        >
          <div class="flex items-center gap-3">
            <Icon name="lucide:sparkles" class="w-5 h-5 text-white" />
            <span>Personalitas</span>
          </div>
          <span class="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full truncate max-w-[110px]">
            {{ preferencesStore.activePersonality }}
          </span>
        </button>
      </div>

      <!-- Section: Riwayat Obrolan (Figma #58:148) -->
      <div class="pt-4">
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <Icon name="lucide:history" class="w-4 h-4 text-stone-800" />
            <span class="font-bold text-base text-stone-900">
              Riwayat obrolan
            </span>
          </div>
          <span
            v-if="chatStore.recentUserQueries.length > 0"
            class="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-orange-200/80 rounded-full text-stone-800"
          >
            {{ chatStore.recentUserQueries.length }} Topik
          </span>
        </div>

        <!-- List Riwayat -->
        <div class="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          <div
            v-if="chatStore.recentUserQueries.length === 0"
            class="p-4 rounded-2xl bg-white/40 border border-orange-300/40 text-center"
          >
            <Icon name="lucide:message-square" class="w-5 h-5 text-stone-500 mx-auto mb-1" />
            <p class="text-xs text-stone-700 font-medium">
              Belum ada riwayat pesan
            </p>
          </div>

          <div
            v-for="(query, idx) in chatStore.recentUserQueries"
            :key="idx"
            class="group p-2.5 rounded-xl bg-white/50 hover:bg-white text-stone-800 text-xs font-semibold flex items-center gap-2 border border-orange-300/40 cursor-pointer transition-all"
            @click="chatStore.setSearchQuery(query)"
          >
            <Icon name="lucide:message-circle" class="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
            <span class="truncate group-hover:text-orange-700 flex-1">
              {{ query }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Akun & Pengaturan (Figma #58:244 & #58:245) -->
    <div class="pt-6 border-t border-orange-300/60 space-y-3">
      <!-- Akun Anda -->
      <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-white/40 border border-orange-300/40">
        <div class="w-9 h-9 rounded-full bg-orange-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
          <Icon name="lucide:user" class="w-5 h-5 text-white" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-bold text-stone-900 truncate">
            {{ authStore.user?.name || 'Pengguna' }}
          </span>
          <span class="text-[10px] text-stone-700 truncate">
            {{ authStore.user?.email || 'user@podofriend.com' }}
          </span>
        </div>
      </div>

      <!-- Pengaturan Kepribadian -->
      <button
        type="button"
        class="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/40 hover:bg-white text-stone-900 text-xs font-bold border border-orange-300/40 transition-colors cursor-pointer"
        @click="emit('openPersonality')"
      >
        <div class="w-8 h-8 rounded-xl bg-stone-800 text-white flex items-center justify-center flex-shrink-0">
          <Icon name="lucide:settings" class="w-4 h-4 text-white" />
        </div>
        <span>Pengaturan AI Podo</span>
      </button>
    </div>
  </aside>
</template>
