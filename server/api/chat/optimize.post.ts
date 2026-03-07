import { streamObject } from 'ai'
import { z } from 'zod'

const BrickTypeEnum = z.enum(['experience', 'education', 'project', 'skill', 'publication', 'custom', 'teaching', 'grant', 'presentation', 'award', 'service'])

const OptimizationResultSchema = z.object({
  sectionOrder: z.array(BrickTypeEnum).describe('Recommended order of section types for this job'),
  brickAdjustments: z.array(z.object({
    brickId: z.string().describe('The ID of the brick to adjust'),
    adjustedContent: z.string().describe('Rephrased/restructured content optimized for the job. NEVER fabricate facts.'),
    reasoning: z.string().describe('Why this adjustment helps match the job description'),
    relevanceScore: z.number().min(0).max(10).describe('How relevant this brick is to the job (0-10)')
  })).describe('Per-brick content adjustments'),
  withinSectionOrder: z.record(
    BrickTypeEnum,
    z.array(z.string())
  ).describe('Recommended brick order within each section type (maps section type to array of brick IDs)'),
  overallTips: z.array(z.string()).describe('General tips for improving the CV for this job')
})

export default defineEventHandler(async (event) => {
  const { jobDescription, selectedBricks, currentSectionOrder, cvMode } = await readBody<{
    jobDescription: string
    selectedBricks: Array<{
      id: string
      type: string
      title: string
      content?: string
      tags?: string[]
      frontmatter?: { subtitle?: string, location?: string, startDate?: string, endDate?: string }
    }>
    currentSectionOrder: string[]
    cvMode?: 'industry' | 'academic'
  }>(event)

  if (!jobDescription) {
    throw createError({ statusCode: 400, message: 'Job description is required' })
  }

  if (!selectedBricks?.length) {
    throw createError({ statusCode: 400, message: 'At least one brick must be selected' })
  }

  const bricksContext = selectedBricks.map(b => ({
    id: b.id,
    type: b.type,
    title: b.title,
    content: b.content?.substring(0, 500),
    tags: b.tags,
    subtitle: b.frontmatter?.subtitle
  }))

  const modeInstructions = cvMode === 'academic'
    ? `\n\nACADEMIC MODE: This is an academic CV. Emphasize research contributions, methodology, teaching philosophy, grant amounts, and publication impact. Use formal academic language. Prioritize publications, grants, and teaching experience.`
    : `\n\nINDUSTRY MODE: This is an industry resume. Emphasize achievements with quantified results, relevant keywords, and action verbs. Focus on impact and business value.`

  const systemPrompt = `You are a CV optimization assistant. Your job is to optimize a CV for a specific job description.

CRITICAL RULES:
- NEVER fabricate or invent facts, experiences, skills, or achievements
- ONLY rephrase, restructure, and emphasize existing information
- Preserve all truthful information from the original content
- Focus on highlighting relevant keywords and rephrasing to match the job's language
- Reorder sections and bricks to put the most relevant content first
${modeInstructions}

The user's selected CV bricks:
${JSON.stringify(bricksContext, null, 2)}

Current section order: ${JSON.stringify(currentSectionOrder)}

For each brick adjustment:
1. Rephrase content to better match the job description's keywords and language
2. Emphasize achievements and skills that are most relevant
3. Keep the same factual information - just present it more effectively
4. Give a relevance score (0-10) based on how relevant the brick is to the job`

  try {
    const model = getModel(event)

    const result = streamObject({
      model,
      schema: OptimizationResultSchema,
      prompt: `Optimize this CV for the following job description:\n\n${jobDescription}`,
      system: systemPrompt
    })

    return result.toTextStreamResponse()
  } catch (error: unknown) {
    const err = error as Error
    console.error('AI optimization error:', error)
    throw createError({
      statusCode: 500,
      message: err.message || 'CV optimization failed'
    })
  }
})
