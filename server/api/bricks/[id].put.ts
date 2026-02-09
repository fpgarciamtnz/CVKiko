import { useDb, bricks, type Brick } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<Partial<Brick>>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Brick ID is required'
    })
  }

  const [existing] = await db.select().from(bricks).where(eq(bricks.id, id))

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Brick not found'
    })
  }

  await db.update(bricks).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(bricks.id, id))

  const [result] = await db.select().from(bricks).where(eq(bricks.id, id))
  return result
})
