// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (hanya diakses di server Nitro Nuxt, aman dari browser)
    aiBaseUrl: process.env.NUXT_AI_BASE_URL || '',
    aiApiKey: process.env.NUXT_AI_API_KEY || '',
    aiModel: process.env.NUXT_AI_MODEL || 'podofriend',
    // Opsional: model khusus emotion classifier (fallback ke aiModel jika kosong)
    aiClassifierModel: process.env.NUXT_AI_CLASSIFIER_MODEL || '',

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },
})

