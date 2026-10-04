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
    aiBaseUrl: process.env.NUXT_AI_BASE_URL || process.env.NUXT_PUBLIC_AI_BASE_URL || 'https://9router.isasilva.web.id/v1',
    aiApiKey: process.env.NUXT_AI_API_KEY || process.env.NUXT_PUBLIC_AI_API_KEY || 'sk-bb5608e3a1baa643-rf15xd-12318235',
    aiModel: process.env.NUXT_AI_MODEL || process.env.NUXT_PUBLIC_AI_MODEL || 'gemini/gemini-3.8-flash',

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },
})

