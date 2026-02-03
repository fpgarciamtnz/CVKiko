import { db, bricks } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Brick ID is required'
    })
  }

  const existing = await db.select().from(bricks).where(eq(bricks.id, id)).get()

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Brick not found'
    })
  }

  await db.delete(bricks).where(eq(bricks.id, id))

  return { success: true }
})
