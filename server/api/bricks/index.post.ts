import { db, bricks, type NewBrick } from '../../database'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    type: string
    title: string
    content?: string
    tags?: string[]
    frontmatter?: Record<string, unknown>
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
    type: body.type as any,
    title: body.title,
    content: body.content ?? '',
    tags: body.tags ?? [],
    frontmatter: body.frontmatter ?? {},
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true
  }

  await db.insert(bricks).values(newBrick)

  return await db.select().from(bricks).where(eq(bricks.id, newBrick.id)).get()
})
