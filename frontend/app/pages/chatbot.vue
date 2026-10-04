<script setup lang="ts">
import { useChatStore } from '~/stores/chat'
import { useSurveyStore } from '~/stores/survey'
import { usePreferencesStore } from '~/stores/preferences'
import { useAiChat } from '~/composables/useAiChat'
import ChatSidebar from '~/components/chat/ChatSidebar.vue'
import ChatBubble from '~/components/chat/ChatBubble.vue'
import ChatTypingIndicator from '~/components/chat/ChatTypingIndicator.vue'
import ChatInput from '~/components/chat/ChatInput.vue'
import ChatPersonalityModal from '~/components/chat/ChatPersonalityModal.vue'
import MoodSurveyModal from '~/components/MoodSurveyModal.vue'

definePageMeta({
  layout: false, // Layout 2-kolom full-screen khusus obrolan
})

useHead({
  title: 'PodoChat - AI Companion Anti-Burnout',
})

const chatStore = useChatStore()
const surveyStore = useSurveyStore()
const preferencesStore = usePreferencesStore()
const { sendMessage } = useAiChat()

const isMobileSidebarOpen = ref(false)
const isPersonalityModalOpen = ref(false)
const messagesContainerRef = ref<HTMLDivElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTo({
      top: messagesContainerRef.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// Auto-scroll saat ada pesan baru atau status loading AI berubah
watch(
  () => [chatStore.messages.length, chatStore.isLoading],
  () => {
    scrollToBottom()
  },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([
    chatStore.fetchSessions(),
    surveyStore.fetchTodaySurvey(),
    preferencesStore.fetchPreferences(),
  ])

  // Jika ada sesi yang sedang aktif, muat pesannya
  if (chatStore.activeSessionId) {
    await chatStore.fetchMessages(chatStore.activeSessionId)
  }
  scrollToBottom()
})

const handleSend = async (text: string) => {
  await sendMessage(text)
  scrollToBottom()
}

const handleStartNewSession = async () => {
  await chatStore.createSession()
  scrollToBottom()
}

const handleOpenPersonality = () => {
  isPersonalityModalOpen.value = true
}

const handleClosePersonality = () => {
  isPersonalityModalOpen.value = false
}

const handleOpenSurvey = () => {
  surveyStore.openModal()
}

// Menentukan ID pesan AI paling akhir/terbaru agar hanya 1 maskot yang muncul di area chat
const latestAiMessageId = computed(() => {
  const msgs = chatStore.filteredMessages
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.sender === 'ai') {
      return msgs[i]!.id
    }
  }
  return null
})
</script>

<template>
  <div class="h-screen w-screen flex bg-[#FFF7ED] text-stone-900 overflow-hidden font-sans">
    <!-- Desktop Left Sidebar (Riwayat Sesi) -->
    <div class="hidden lg:block h-full">
      <ChatSidebar
        @open-personality="handleOpenPersonality"
        @new-chat="scrollToBottom"
      />
    </div>

    <!-- Mobile Drawer Backdrop & Sidebar -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-50 lg:hidden flex"
    >
      <div
        class="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        @click="isMobileSidebarOpen = false"
      />
      <div class="relative z-10 w-[310px] h-full shadow-2xl">
        <ChatSidebar
          :is-open-mobile="true"
          @close-mobile="isMobileSidebarOpen = false"
          @open-personality="handleOpenPersonality"
          @new-chat="scrollToBottom"
        />
      </div>
    </div>

    <!-- Main Chat Workspace (Area Chat Utama) -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Top Navigation & Control Header -->
      <header
        class="w-full h-20 px-4 sm:px-8 border-b border-orange-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between z-20 flex-shrink-0"
      >
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle Button -->
          <button
            type="button"
            class="lg:hidden p-2.5 rounded-full bg-orange-100 hover:bg-orange-200 text-stone-800 transition-colors cursor-pointer"
            aria-label="Buka Menu Sesi"
            @click="isMobileSidebarOpen = true"
          >
            <Icon name="lucide:menu" class="w-5 h-5" />
          </button>

          <!-- Back Button: Kembali ke Dashboard -->
          <NuxtLink
            to="/dashboard"
            class="px-5 py-2.5 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Icon name="lucide:arrow-left" class="w-4 h-4 text-white" />
            <span>Kembali</span>
          </NuxtLink>

          <!-- Sesi Aktif Title Badge -->
          <div
            v-if="chatStore.activeSession"
            class="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-stone-700"
          >
            <Icon name="lucide:message-square" class="w-3.5 h-3.5 text-orange-500" />
            <span class="truncate max-w-[200px]">{{ chatStore.activeSession.title || 'Sesi Obrolan' }}</span>
          </div>
        </div>

        <!-- Center / Right Badges: Mood & Personality Context -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Mood Status Badge -->
          <div
            v-if="surveyStore.todaySurvey?.mood"
            class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-xs font-bold text-orange-950 cursor-pointer hover:bg-orange-200/80 transition-colors"
            title="Klik untuk ubah mood"
            @click="handleOpenSurvey"
          >
            <Icon name="lucide:heart-pulse" class="w-4 h-4 text-orange-600" />
            <span>Mood: {{ surveyStore.todaySurvey.mood }}</span>
          </div>

          <!-- Quick Fill Mood Button if Not Filled Yet -->
          <button
            v-else
            type="button"
            class="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold hover:bg-amber-200 transition-colors cursor-pointer"
            @click="handleOpenSurvey"
          >
            <Icon name="lucide:alert-circle" class="w-4 h-4 text-amber-600" />
            <span>Isi Mood Hari Ini</span>
          </button>

          <!-- Active Personality Pill -->
          <button
            type="button"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-orange-100 border border-stone-200 hover:border-orange-300 text-xs font-bold text-stone-800 transition-colors cursor-pointer"
            @click="handleOpenPersonality"
          >
            <Icon name="lucide:sparkles" class="w-4 h-4 text-orange-500" />
            <span class="hidden md:inline">{{ preferencesStore.activePersonality }}</span>
            <span class="md:hidden">Gaya AI</span>
          </button>
        </div>
      </header>

      <!-- Active Search Filter Banner -->
      <div
        v-if="chatStore.searchQuery"
        class="bg-orange-200/80 px-6 py-2 border-b border-orange-300 text-xs font-bold text-stone-800 flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <Icon name="lucide:search" class="w-3.5 h-3.5 text-stone-700" />
          <span>Menampilkan hasil pencarian untuk: "{{ chatStore.searchQuery }}"</span>
        </div>
        <button
          type="button"
          class="text-xs font-extrabold text-orange-800 hover:text-stone-950 underline cursor-pointer"
          @click="chatStore.setSearchQuery('')"
        >
          Reset Filter
        </button>
      </div>

      <!-- Messages Stream Area -->
      <div
        ref="messagesContainerRef"
        class="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-4"
      >
        <!-- 1. Kondisi activeSessionId null: Placeholder "Pilih atau mulai obrolan baru" -->
        <div
          v-if="chatStore.activeSessionId === null"
          class="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-lg mx-auto"
        >
          <div class="w-32 h-32 flex items-center justify-center p-3">
            <AppMascot size="lg" animation="idle" />
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-black text-stone-900 tracking-tight">
              Pilih atau mulai obrolan baru
            </h2>
            <p class="text-stone-600 text-sm font-medium leading-relaxed">
              Pilih sesi obrolan yang tersimpan di sidebar sebelah kiri, atau buat obrolan baru untuk mulai berdiskusi dan menjaga fokus belajarmu bersama Podo.
            </p>
          </div>
          <button
            type="button"
            class="px-6 py-3 rounded-full bg-[#F56A16] hover:bg-orange-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            @click="handleStartNewSession"
          >
            <Icon name="lucide:plus-circle" class="w-5 h-5 text-white" />
            <span>Mulai Obrolan Baru</span>
          </button>
        </div>

        <!-- 2. Kondisi Sedang Memuat Pesan Sesi -->
        <div
          v-else-if="chatStore.isFetchingMessages"
          class="h-full flex flex-col items-center justify-center text-center p-8 space-y-3"
        >
          <div class="w-16 h-16 flex items-center justify-center animate-pulse">
            <AppMascot size="sm" animation="searching" />
          </div>
          <p class="text-sm font-bold text-stone-600">
            Menghubungkan ke memori obrolan Podo...
          </p>
        </div>

        <!-- 3. Kondisi Sesi Aktif Tapi Belum Ada Pesan -->
        <div
          v-else-if="!chatStore.hasMessages"
          class="max-w-2xl mx-auto py-10 flex flex-col items-center text-center space-y-6"
        >
          <!-- Mascot Greeting Frame -->
          <div class="w-24 h-24 flex items-center justify-center p-2 rounded-3xl bg-orange-100 border-2 border-orange-300 shadow-sm animate-bounce-short">
            <AppMascot
              size="md"
              :animation="
                chatStore.mascotState === 'thinking'
                  ? 'thinking'
                  : chatStore.mascotState === 'listening'
                  ? 'listening'
                  : 'excited'
              "
            />
          </div>

          <!-- Greeting Card -->
          <div class="p-6 rounded-3xl bg-white border-2 border-orange-300 shadow-md max-w-lg">
            <h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Halo! Aku Podo, Teman Belajarmu
            </h2>
            <p class="text-stone-700 text-sm sm:text-base mt-2 leading-relaxed font-medium">
              Pastikan mood kamu hari ini sudah sesuai biar aku bisa bantu mendampingi belajarmu dengan optimal dan mencegah burnout!
            </p>
          </div>

          <!-- Tips Banner (Lucide Icons, No Emojis) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
            <div class="p-4 rounded-2xl bg-white/70 border border-orange-200 flex items-start gap-3 shadow-xs">
              <div class="p-2 rounded-xl bg-orange-100 text-orange-600 flex-shrink-0">
                <Icon name="lucide:timer" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-xs text-stone-900">Teknik Pomodoro</h4>
                <p class="text-[11px] text-stone-600 mt-0.5">Fokus 25 menit, lalu istirahat 5 menit untuk menjaga performa otak.</p>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-white/70 border border-orange-200 flex items-start gap-3 shadow-xs">
              <div class="p-2 rounded-xl bg-orange-100 text-orange-600 flex-shrink-0">
                <Icon name="lucide:shield-check" class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-xs text-stone-900">Cegah Burnout</h4>
                <p class="text-[11px] text-stone-600 mt-0.5">Katakan jika lelah, Podo akan merekomendasikan jeda dan pernapasan.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Daftar Pesan Sesi Aktif -->
        <template v-else>
          <ChatBubble
            v-for="msg in chatStore.filteredMessages"
            :key="msg.id"
            :message="msg"
            :is-latest-ai="msg.id === latestAiMessageId"
          />

          <!-- AI Typing Indicator: Hanya muncul jika pesan AI belum ditambahkan ke daftar pesan -->
          <ChatTypingIndicator v-if="chatStore.isLoading && (!chatStore.messages.length || chatStore.messages[chatStore.messages.length - 1]?.sender !== 'ai')" />
        </template>
      </div>

      <!-- Bottom Chat Input Section -->
      <footer
        class="w-full px-4 sm:px-8 lg:px-12 py-4 bg-[#FFF7ED]/95 border-t border-orange-200/50 backdrop-blur-sm flex-shrink-0"
      >
        <div class="max-w-4xl mx-auto">
          <ChatInput
            :is-loading="chatStore.isLoading"
            @send="handleSend"
          />
        </div>
      </footer>
    </main>

    <!-- Modal Pengaturan Personalitas AI -->
    <ChatPersonalityModal
      :is-open="isPersonalityModalOpen"
      @close="handleClosePersonality"
    />

    <!-- Modal Survei Mood Harian -->
    <MoodSurveyModal />
  </div>
</template>
