import { useDb, bricks, type NewBrick } from '../../database'
import { eq } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<{
    type: string
    title: string
    content?: string
    tags?: string[]
    frontmatter?: Record<string, unknown>
    structuredData?: Record<string, unknown>
    sortOrder?: number
    isActive?: boolean
  }>(event)

  if (!body.type) {
    throw createError({
      statusCode: 400,
      message: 'Brick type is required'
    })
  }

  // Fallback title if empty
  const title = body.title?.trim() || `Untitled ${body.type.charAt(0).toUpperCase() + body.type.slice(1)}`

  const newBrick: NewBrick = {
    id: crypto.randomUUID(),
    type: body.type as BrickType,
    title,
    content: body.content ?? '',
    tags: body.tags ?? [],
    frontmatter: body.frontmatter ?? {},
    structuredData: body.structuredData ?? {},
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true
  }

  try {
    await db.insert(bricks).values(newBrick)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error'
    throw createError({
      statusCode: 500,
      message: `Failed to insert brick: ${message}`
    })
  }

  const [result] = await db.select().from(bricks).where(eq(bricks.id, newBrick.id))
  return result
})
