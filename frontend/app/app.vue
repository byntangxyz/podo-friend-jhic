<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - PodoFriend` : 'PodoFriend - Anti-Burnout Focus & Study Companion'
  },
  bodyAttrs: {
    class: 'bg-orange-50 text-stone-900 min-h-screen font-sans',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
