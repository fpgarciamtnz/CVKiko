// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // AI Provider config (choose one)
    // For Groq (free): GROQ_API_KEY
    // For Cloudflare Workers AI: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN
    // For Anthropic: ANTHROPIC_API_KEY
    aiProvider: process.env.AI_PROVIDER || 'cloudflare', // 'cloudflare' | 'groq' | 'anthropic'
    groqApiKey: process.env.GROQ_API_KEY || '',
    cfAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    cfApiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || ''
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'cloudflare-pages'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
