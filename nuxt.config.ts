// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils/module'
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
    cfTierMode: process.env.CF_TIER_MODE || 'tier1', // tier1 | tier2 | tier3 | auto
    cfTier1Model: process.env.CF_TIER1_MODEL || '@cf/meta/llama-3.1-8b-instruct',
    cfTier2Model: process.env.CF_TIER2_MODEL || '@cf/meta/llama-3.1-70b-instruct',
    cfTier3Model: process.env.CF_TIER3_MODEL || '@cf/mistral/mistral-7b-instruct-v0.2',
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
