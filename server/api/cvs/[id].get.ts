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

  const [cv] = await db.select().from(cvs).where(eq(cvs.id, id))

  if (!cv) {
    throw createError({
      statusCode: 404,
      message: 'CV not found'
    })
  }

  const brickLinks = await db.select().from(cvBricks).where(eq(cvBricks.cvId, id)).orderBy(cvBricks.sectionOrder)

  return {
    ...cv,
    brickIds: brickLinks.map(link => link.brickId)
  }
})
