import { useDb, cvs, cvBricks, bricks, settings } from '../../../database'
import { eq, inArray } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'CV slug is required'
    })
  }

  const [cv] = await db.select().from(cvs).where(eq(cvs.slug, slug))

  if (!cv) {
    throw createError({
      statusCode: 404,
      message: 'CV not found'
    })
  }

  if (!cv.isPublished) {
    throw createError({
      statusCode: 404,
      message: 'This CV is not published'
    })
  }

  // Get brick IDs for this CV in order
  const brickLinks = await db.select().from(cvBricks).where(eq(cvBricks.cvId, cv.id)).orderBy(cvBricks.sectionOrder)
  const brickIds = brickLinks.map(link => link.brickId)

  // Fetch actual bricks
  let cvBricksList: typeof bricks.$inferSelect[] = []
  if (brickIds.length > 0) {
    cvBricksList = await db.select().from(bricks).where(inArray(bricks.id, brickIds))
    // Sort by junction order
    cvBricksList.sort((a, b) => brickIds.indexOf(a.id) - brickIds.indexOf(b.id))
  }

  const brickTypeMap = new Map(cvBricksList.map(brick => [brick.id, brick.type as BrickType]))
  const placements = brickLinks.map((link) => ({
    brickId: link.brickId,
    sectionType: (link.cvSectionType as BrickType | null) || brickTypeMap.get(link.brickId) || 'custom',
    order: link.sectionOrder
  }))

  const placementMap = new Map(placements.map(placement => [placement.brickId, placement.sectionType]))
  const bricksWithPlacement = cvBricksList.map((brick) => ({
    ...brick,
    cvSectionType: placementMap.get(brick.id) || brick.type
  }))

  const sectionOrder = placements
    .map(placement => placement.sectionType)
    .filter((type, index, arr) => arr.indexOf(type) === index)

  // Fetch settings
  const [userSettings] = await db.select().from(settings).where(eq(settings.id, 'default'))

  return {
    cv: {
      id: cv.id,
      name: cv.name,
      slug: cv.slug
    },
    bricks: bricksWithPlacement,
    placements,
    sectionOrder,
    settings: userSettings || null
  }
})
