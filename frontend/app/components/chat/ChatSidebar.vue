<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import { usePreferencesStore } from '~/stores/preferences'
import type { ChatSession } from '~/types/chat'

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

const handleNewChat = async () => {
  await chatStore.createSession()
  emit('newChat')
  emit('closeMobile')
}

const handleSelectSession = async (session: ChatSession) => {
  if (String(chatStore.activeSessionId) === String(session.id)) {
    emit('closeMobile')
    return
  }
  await chatStore.fetchMessages(session.id)
  emit('closeMobile')
}

const toggleSearch = () => {
  showSearchInput.value = !showSearchInput.value
  if (!showSearchInput.value) {
    chatStore.setSearchQuery('')
  }
}

const formatSessionDate = (isoStr?: string) => {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const now = new Date()
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
</script>

<template>
  <aside
    class="w-[320px] lg:w-[350px] flex-shrink-0 bg-[#FBBE97] flex flex-col justify-between p-6 shadow-md border-r border-orange-300/50 transition-all z-30 h-full overflow-hidden"
  >
    <!-- Top Area: Brand & Actions -->
    <div class="flex-1 flex flex-col min-h-0 space-y-5">
      <!-- Brand Header -->
      <div class="flex items-center justify-between pb-2 border-b border-orange-300/60 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 flex items-center justify-center">
            <AppMascot size="sm" :animation="chatStore.searchQuery ? 'searching' : 'idle'" />
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
          class="lg:hidden p-2 rounded-full hover:bg-orange-300/60 text-stone-800 transition-colors"
          @click="emit('closeMobile')"
        >
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Action Pill Buttons -->
      <div class="space-y-2.5 flex-shrink-0">
        <!-- Button: Chat Baru (Pemicu createSession) -->
        <button
          type="button"
          class="w-full h-12 px-5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
          @click="handleNewChat"
        >
          <Icon name="lucide:plus-circle" class="w-5 h-5 text-white" />
          <span>Chat Baru</span>
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
            <span>Cari Obrolan</span>
          </button>

          <!-- Active Search Input Field -->
          <div v-else class="relative">
            <input
              v-model="chatStore.searchQuery"
              type="text"
              placeholder="Cari sesi obrolan..."
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

      <!-- Section: Riwayat Sesi Obrolan -->
      <div class="flex-1 flex flex-col min-h-0 pt-2">
        <div class="flex items-center justify-between mb-2 px-1 flex-shrink-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:history" class="w-4 h-4 text-stone-800" />
            <span class="font-bold text-sm text-stone-900">
              Riwayat Obrolan
            </span>
          </div>
          <span
            v-if="chatStore.filteredSessions.length > 0"
            class="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-orange-200/80 rounded-full text-stone-800"
          >
            {{ chatStore.filteredSessions.length }} Sesi
          </span>
        </div>

        <!-- Loading Sesi -->
        <div
          v-if="chatStore.isFetchingSessions"
          class="p-4 rounded-2xl bg-white/30 flex items-center justify-center gap-2 text-stone-700 text-xs font-semibold"
        >
          <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin text-orange-600" />
          <span>Memuat sesi...</span>
        </div>

        <!-- Empty State Sesi -->
        <div
          v-else-if="chatStore.filteredSessions.length === 0"
          class="p-4 rounded-2xl bg-white/40 border border-orange-300/40 text-center space-y-1.5 flex-shrink-0"
        >
          <Icon name="lucide:message-square-dashed" class="w-6 h-6 text-stone-500 mx-auto" />
          <p class="text-xs text-stone-800 font-bold">
            {{ chatStore.searchQuery ? 'Tidak ada sesi yang cocok' : 'Belum ada riwayat sesi' }}
          </p>
          <p class="text-[11px] text-stone-600">
            {{ chatStore.searchQuery ? 'Coba gunakan kata kunci lain' : 'Klik "Chat Baru" untuk mulai berdiskusi dengan Podo' }}
          </p>
        </div>

        <!-- List Sesi Obrolan (Scrollable) -->
        <div
          v-else
          class="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin"
        >
          <button
            v-for="session in chatStore.filteredSessions"
            :key="session.id"
            type="button"
            class="w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-2.5 border"
            :class="
              String(chatStore.activeSessionId) === String(session.id)
                ? 'bg-white text-stone-900 border-orange-500 shadow-md ring-2 ring-orange-400/40'
                : 'bg-white/50 hover:bg-white text-stone-800 border-orange-300/40 hover:border-orange-300 shadow-xs'
            "
            @click="handleSelectSession(session)"
          >
            <!-- Icon Sesi -->
            <div
              class="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              :class="
                String(chatStore.activeSessionId) === String(session.id)
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-600'
              "
            >
              <Icon name="lucide:message-circle" class="w-4 h-4" />
            </div>

            <!-- Detail Sesi -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span
                  class="text-xs font-bold truncate"
                  :class="String(chatStore.activeSessionId) === String(session.id) ? 'text-orange-950' : 'text-stone-900'"
                >
                  {{ session.title || 'Sesi Obrolan' }}
                </span>
                <span class="text-[10px] text-stone-500 flex-shrink-0">
                  {{ formatSessionDate(session.updated_at || session.created_at) }}
                </span>
              </div>
              <p class="text-[11px] text-stone-600 truncate mt-0.5">
                {{ session.last_message || 'Belum ada percakapan' }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Akun & Pengaturan -->
    <div class="pt-4 border-t border-orange-300/60 space-y-2 flex-shrink-0">
      <!-- Akun Pengguna -->
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
