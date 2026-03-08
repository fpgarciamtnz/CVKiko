import { generateText } from 'ai'
import { getCloudflareTierModels, getModel, resolveAIConfig } from '../../utils/ai-providers'

export default defineEventHandler(async (event) => {
  const { jobDescription, bricks } = await readBody<{
    jobDescription: string
    bricks: Array<{ id: string, type: string, title: string, frontmatter?: { subtitle?: string }, content?: string, tags?: string[] }>
  }>(event)

  if (!jobDescription) {
    throw createError({
      statusCode: 400,
      message: 'Job description is required'
    })
  }

  const bricksContext = bricks.map(b => ({
    id: b.id,
    type: b.type,
    title: b.title,
    subtitle: b.frontmatter?.subtitle,
    content: b.content?.substring(0, 300),
    tags: b.tags
  }))

  const systemPrompt = `You are a CV optimization assistant. Analyze job descriptions and recommend which bricks (experiences) are most relevant.

User's bricks:
${JSON.stringify(bricksContext, null, 2)}

When analyzing:
1. Identify key requirements from the job description
2. Match them to relevant bricks by ID
3. Explain why each brick is relevant
4. Note any gaps

Format response clearly with:
- Key Requirements
- Recommended Bricks (include brick IDs)
- Missing Skills
- Tips`

  const userMessage = `Analyze this job and suggest bricks:\n\n${jobDescription}`

  try {
    const aiConfig = resolveAIConfig(event)
    const cloudflareModels = aiConfig.provider === 'cloudflare' && aiConfig.cfTierMode === 'auto'
      ? getCloudflareTierModels(event)
      : []

    const candidateModels = cloudflareModels.length > 0 ? cloudflareModels : [undefined]
    let lastError: unknown

    for (const cloudflareModel of candidateModels) {
      try {
        const { text } = await generateText({
          model: getModel(event, { cloudflareModel }),
          system: systemPrompt,
          prompt: userMessage,
          temperature: 0.7,
          maxOutputTokens: 2000
        })

        return { response: text }
      } catch (error: unknown) {
        lastError = error
        console.error('AI analysis attempt failed', {
          provider: aiConfig.provider,
          cloudflareModel: cloudflareModel || 'default'
        }, error)
      }
    }

    throw lastError || new Error('AI analysis failed')
  } catch (error: unknown) {
    const err = error as Error
    throw createError({
      statusCode: 500,
      message: err.message || 'AI analysis failed'
    })
  }
})
