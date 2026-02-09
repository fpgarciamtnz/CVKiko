import { useDb, bricks, type NewBrick } from '../../database'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
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

  if (!body.type || !body.title) {
    throw createError({
      statusCode: 400,
      message: 'Type and title are required'
    })
  }

  const newBrick: NewBrick = {
    id: uuidv4(),
    type: body.type as BrickType,
    title: body.title,
    content: body.content ?? '',
    tags: body.tags ?? [],
    frontmatter: body.frontmatter ?? {},
    structuredData: body.structuredData ?? {},
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true
  }

  await db.insert(bricks).values(newBrick)

  const [result] = await db.select().from(bricks).where(eq(bricks.id, newBrick.id))
  return result
})
