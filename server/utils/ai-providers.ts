import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'
import type { H3Event } from 'h3'

export function getModel(event: H3Event): LanguageModel {
  const config = useRuntimeConfig(event)
  const provider = config.aiProvider || 'groq'

  if (provider === 'groq' && config.groqApiKey) {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: config.groqApiKey
    })
    return groq('llama-3.3-70b-versatile')
  }

  if (provider === 'anthropic' && config.anthropicApiKey) {
    const anthropic = createAnthropic({
      apiKey: config.anthropicApiKey
    })
    return anthropic('claude-3-5-sonnet-20241022')
  }

  if (provider === 'cloudflare' && config.cfAccountId && config.cfApiToken) {
    // Use Cloudflare Workers AI via OpenAI-compatible gateway
    const cf = createOpenAI({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${config.cfAccountId}/ai/v1`,
      apiKey: config.cfApiToken
    })
    return cf('@cf/meta/llama-3.1-8b-instruct')
  }

  throw new Error(`No API key configured for provider: ${provider}`)
}
