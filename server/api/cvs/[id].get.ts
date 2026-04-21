import { useDb, cvs, cvBricks, bricks } from '../../database'
import { eq, inArray } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

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
  const brickIds = brickLinks.map(link => link.brickId)

  const brickTypeMap = new Map<string, BrickType>()
  if (brickIds.length > 0) {
    const linkedBricks = await db.select({ id: bricks.id, type: bricks.type }).from(bricks).where(inArray(bricks.id, brickIds))
    for (const brick of linkedBricks) {
      brickTypeMap.set(brick.id, brick.type as BrickType)
    }
  }

  const placements = brickLinks.map(link => ({
    brickId: link.brickId,
    sectionType: (link.cvSectionType as BrickType | null) || brickTypeMap.get(link.brickId) || 'custom',
    order: link.sectionOrder
  }))

  return {
    ...cv,
    brickIds,
    placements
  }
})
