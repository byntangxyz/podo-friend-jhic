<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

useHead({
  title: 'AI Companion - Chat',
})
</script>

<template>
  <div class="max-w-4xl mx-auto w-full py-8 text-center flex flex-col items-center">
    <div class="w-24 h-24 rounded-3xl bg-orange-100 flex items-center justify-center p-2 mb-6 shadow-sm border border-orange-200">
      <AppMascot size="lg" />
    </div>

    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider mb-4">
      <Icon name="lucide:sparkles" class="w-4 h-4 text-orange-600" />
      <span>Fitur Mendatang • Phase 3</span>
    </div>

    <h1 class="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
      Podo AI Companion
    </h1>
    <p class="text-sm sm:text-base text-stone-600 mt-3 max-w-lg leading-relaxed">
      Modul chat interaktif berbasis LangChain dan personalisasi kepribadian AI akan diimplementasikan pada <strong>Phase 3</strong>. Podo siap menemanimu belajar dan menjawab pertanyaanmu!
    </p>

    <div class="mt-8 flex items-center gap-4">
      <NuxtLink
        to="/dashboard"
        class="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Icon name="lucide:timer" class="w-4 h-4" />
        <span>Kembali ke Timer Pomodoro</span>
      </NuxtLink>
    </div>
  </div>
</template>
