export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
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

  // Determine which AI provider to use
  const provider = config.aiProvider || 'groq'

  try {
    let response: string

    if (provider === 'groq' && config.groqApiKey) {
      response = await callGroq(config.groqApiKey, systemPrompt, userMessage)
    } else if (provider === 'cloudflare' && config.cfAccountId && config.cfApiToken) {
      response = await callCloudflareAI(config.cfAccountId, config.cfApiToken, systemPrompt, userMessage)
    } else if (provider === 'anthropic' && config.anthropicApiKey) {
      response = await callAnthropic(config.anthropicApiKey, systemPrompt, userMessage)
    } else {
      throw new Error(`No API key configured for provider: ${provider}`)
    }

    return { response }
  } catch (error: unknown) {
    const err = error as Error
    console.error('AI API error:', error)
    throw createError({
      statusCode: 500,
      message: err.message || 'AI analysis failed'
    })
  }
})

// Groq API (FREE - 14,400 requests/day)
async function callGroq(apiKey: string, system: string, user: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// Cloudflare Workers AI (FREE tier available)
async function callCloudflareAI(accountId: string, apiToken: string, system: string, user: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cloudflare AI error: ${error}`)
  }

  const data = await response.json()
  return data.result?.response || ''
}

// Anthropic (Paid)
async function callAnthropic(apiKey: string, system: string, user: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}
