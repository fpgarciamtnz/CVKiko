import { generateObject } from 'ai'
import { z } from 'zod'

const SynthesizeDescriptionSchema = z.object({
  description: z.string().describe('A concise 1-2 sentence project description for a CV in English.')
})

export default defineEventHandler(async (event) => {
  const {
    name,
    role,
    goal,
    outcome,
    technologies
  } = await readBody<{
    name?: string
    role?: string
    goal?: string
    outcome?: string
    technologies?: string[]
  }>(event)

  const trimmedGoal = goal?.trim() || ''
  const trimmedOutcome = outcome?.trim() || ''

  if (!trimmedGoal && !trimmedOutcome) {
    throw createError({
      statusCode: 400,
      message: 'Goal or outcome is required to synthesize a description.'
    })
  }

  try {
    const model = getModel(event)

    const { object } = await generateObject({
      model,
      schema: SynthesizeDescriptionSchema,
      system: `You are a CV writing assistant.
Write concise, professional project descriptions in English.
Do not fabricate facts.
Use only provided data.
Return a short 1-2 sentence description.`,
      prompt: `Project Name: ${name || 'N/A'}
Role: ${role || 'N/A'}
Goal: ${trimmedGoal || 'N/A'}
Outcome: ${trimmedOutcome || 'N/A'}
Technologies: ${(technologies || []).filter(Boolean).join(', ') || 'N/A'}`
    })

    return {
      success: true as const,
      description: object.description.trim()
    }
  } catch (error: unknown) {
    const err = error as Error
    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to synthesize project description'
    })
  }
})
