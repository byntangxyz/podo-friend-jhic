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
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      aiBaseUrl: process.env.NUXT_PUBLIC_AI_BASE_URL || 'http://localhost:20128/v1',
      aiApiKey: process.env.NUXT_PUBLIC_AI_API_KEY || '9router-default-key',
      aiModel: process.env.NUXT_PUBLIC_AI_MODEL || 'gpt-4o-mini',
    },
  },
})

