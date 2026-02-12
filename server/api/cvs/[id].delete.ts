import { useDb, cvs, cvBricks } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'CV ID is required'
    })
  }

  const [existing] = await db.select().from(cvs).where(eq(cvs.id, id))

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'CV not found'
    })
  }

  // Delete junction rows first, then CV
  await db.delete(cvBricks).where(eq(cvBricks.cvId, id))
  await db.delete(cvs).where(eq(cvs.id, id))

  return { success: true }
})
