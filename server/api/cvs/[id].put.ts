import { useDb, cvs, cvBricks, type NewCVBrick } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string
    slug?: string
    brickIds?: string[]
    isPublished?: boolean
  }>(event)

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

  // Build update object
  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name !== undefined) updates.name = body.name
  if (body.slug !== undefined) updates.slug = body.slug
  if (body.isPublished !== undefined) updates.isPublished = body.isPublished

  await db.update(cvs).set(updates).where(eq(cvs.id, id))

  // Replace junction rows if brickIds provided
  if (body.brickIds !== undefined) {
    await db.delete(cvBricks).where(eq(cvBricks.cvId, id))
    if (body.brickIds.length > 0) {
      const junctionRows: NewCVBrick[] = body.brickIds.map((brickId, index) => ({
        id: crypto.randomUUID(),
        cvId: id,
        brickId,
        sectionOrder: index
      }))
      await db.insert(cvBricks).values(junctionRows)
    }
  }

  const [result] = await db.select().from(cvs).where(eq(cvs.id, id))
  const brickLinks = await db.select().from(cvBricks).where(eq(cvBricks.cvId, id)).orderBy(cvBricks.sectionOrder)

  return {
    ...result,
    brickIds: brickLinks.map(link => link.brickId)
  }
})
