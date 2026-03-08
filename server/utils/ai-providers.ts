import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'
import type { H3Event } from 'h3'

type TierMode = 'tier1' | 'tier2' | 'tier3' | 'auto'

interface ResolvedAIConfig {
  provider: string
  groqApiKey: string
  anthropicApiKey: string
  cfAccountId: string
  cfApiToken: string
  cfTierMode: TierMode
  cfTier1Model: string
  cfTier2Model: string
  cfTier3Model: string
}

function readCloudflareEnv(event: H3Event): Record<string, string> {
  const cloudflareEnv = (event.context as { cloudflare?: { env?: Record<string, unknown> } }).cloudflare?.env
  if (!cloudflareEnv) return {}

  return Object.entries(cloudflareEnv).reduce((acc, [key, value]) => {
    if (typeof value === 'string') acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

function pickString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function normalizeTierMode(value: string): TierMode {
  const normalized = value.toLowerCase()
  if (normalized === 'tier1' || normalized === 'tier2' || normalized === 'tier3' || normalized === 'auto') {
    return normalized
  }
  return 'tier1'
}

export function resolveAIConfig(event: H3Event): ResolvedAIConfig {
  const config = useRuntimeConfig(event)
  const cfEnv = readCloudflareEnv(event)

  const provider = pickString(
    config.aiProvider,
    process.env.AI_PROVIDER,
    cfEnv.AI_PROVIDER,
    'cloudflare'
  ).toLowerCase()

  return {
    provider,
    groqApiKey: pickString(config.groqApiKey, process.env.GROQ_API_KEY, cfEnv.GROQ_API_KEY),
    anthropicApiKey: pickString(config.anthropicApiKey, process.env.ANTHROPIC_API_KEY, cfEnv.ANTHROPIC_API_KEY),
    cfAccountId: pickString(
      config.cfAccountId,
      process.env.CLOUDFLARE_ACCOUNT_ID,
      process.env.CF_ACCOUNT_ID,
      cfEnv.CLOUDFLARE_ACCOUNT_ID,
      cfEnv.CF_ACCOUNT_ID
    ),
    cfApiToken: pickString(
      config.cfApiToken,
      process.env.CLOUDFLARE_API_TOKEN,
      process.env.CF_API_TOKEN,
      cfEnv.CLOUDFLARE_API_TOKEN,
      cfEnv.CF_API_TOKEN
    ),
    cfTierMode: normalizeTierMode(pickString(
      config.cfTierMode,
      process.env.CF_TIER_MODE,
      cfEnv.CF_TIER_MODE,
      'tier1'
    )),
    cfTier1Model: pickString(
      config.cfTier1Model,
      process.env.CF_TIER1_MODEL,
      cfEnv.CF_TIER1_MODEL,
      '@cf/meta/llama-3.1-8b-instruct'
    ),
    cfTier2Model: pickString(
      config.cfTier2Model,
      process.env.CF_TIER2_MODEL,
      cfEnv.CF_TIER2_MODEL,
      '@cf/meta/llama-3.1-70b-instruct'
    ),
    cfTier3Model: pickString(
      config.cfTier3Model,
      process.env.CF_TIER3_MODEL,
      cfEnv.CF_TIER3_MODEL,
      '@cf/mistral/mistral-7b-instruct-v0.2'
    )
  }
}

export function getCloudflareTierModels(event: H3Event): string[] {
  const cfg = resolveAIConfig(event)
  const models = [cfg.cfTier1Model, cfg.cfTier2Model, cfg.cfTier3Model].filter(Boolean)
  return [...new Set(models)]
}

export function getModel(
  event: H3Event,
  options: { cloudflareModel?: string } = {}
): LanguageModel {
  const cfg = resolveAIConfig(event)

  if (cfg.provider === 'groq' && cfg.groqApiKey) {
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: cfg.groqApiKey
    })
    return groq('llama-3.3-70b-versatile')
  }

  if (cfg.provider === 'anthropic' && cfg.anthropicApiKey) {
    const anthropic = createAnthropic({
      apiKey: cfg.anthropicApiKey
    })
    return anthropic('claude-haiku-4-5-20251001')
  }

  if (cfg.provider === 'cloudflare' && cfg.cfAccountId && cfg.cfApiToken) {
    const cf = createOpenAI({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${cfg.cfAccountId}/ai/v1`,
      apiKey: cfg.cfApiToken
    })

    const tierModel = options.cloudflareModel || (
      cfg.cfTierMode === 'tier2'
        ? cfg.cfTier2Model
        : cfg.cfTierMode === 'tier3'
          ? cfg.cfTier3Model
          : cfg.cfTier1Model
    )

    return cf(tierModel)
  }

  if (cfg.provider === 'cloudflare') {
    throw new Error(
      'Cloudflare AI is selected but credentials are missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (or CF_ACCOUNT_ID and CF_API_TOKEN).'
    )
  }

  throw new Error(`No API key configured for provider: ${cfg.provider}`)
}
