<script setup lang="ts">
// Alias rute /chat ke /chatbot sesuai spesifikasi dokumen Phase 3.1
await navigateTo('/chatbot', { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
    <div class="text-center space-y-2">
      <div class="w-12 h-12 mx-auto animate-spin flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-8 h-8 text-orange-500" />
      </div>
      <p class="text-sm font-bold text-stone-700">Mengarahkan ke PodoChat...</p>
    </div>
  </div>
</template>
