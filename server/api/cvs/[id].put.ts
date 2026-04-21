import { useDb, cvs, cvBricks, bricks, type NewCVBrick } from '../../database'
import { eq, inArray } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

const BRICK_TYPES: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom', 'teaching', 'grant', 'presentation', 'award', 'service']

function isBrickType(value: unknown): value is BrickType {
  return typeof value === 'string' && BRICK_TYPES.includes(value as BrickType)
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{
    name?: string
    slug?: string
    brickIds?: string[]
    placements?: Array<{ brickId: string, sectionType: BrickType, order: number }>
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

  const normalizedPlacements = (body.placements || [])
    .filter(p => typeof p?.brickId === 'string' && p.brickId && isBrickType(p.sectionType))
    .sort((a, b) => a.order - b.order)
    .filter((placement, index, arr) => arr.findIndex(item => item.brickId === placement.brickId) === index)

  // Replace junction rows if placements or brickIds provided
  if (body.brickIds !== undefined || body.placements !== undefined) {
    await db.delete(cvBricks).where(eq(cvBricks.cvId, id))

    if (normalizedPlacements.length > 0) {
      const junctionRows: NewCVBrick[] = normalizedPlacements.map((placement, index) => ({
        id: crypto.randomUUID(),
        cvId: id,
        brickId: placement.brickId,
        sectionOrder: index,
        cvSectionType: placement.sectionType
      }))
      await db.insert(cvBricks).values(junctionRows)
    } else if ((body.brickIds || []).length > 0) {
      const junctionRows: NewCVBrick[] = (body.brickIds || []).map((brickId, index) => ({
        id: crypto.randomUUID(),
        cvId: id,
        brickId,
        sectionOrder: index,
        cvSectionType: null
      }))
      await db.insert(cvBricks).values(junctionRows)
    }
  }

  const [result] = await db.select().from(cvs).where(eq(cvs.id, id))
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
    ...result,
    brickIds,
    placements
  }
})
