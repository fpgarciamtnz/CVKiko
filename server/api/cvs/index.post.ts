import { useDb, cvs, cvBricks, type NewCV, type NewCVBrick } from '../../database'
import { eq } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

const BRICK_TYPES: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom', 'teaching', 'grant', 'presentation', 'award', 'service']

function isBrickType(value: unknown): value is BrickType {
  return typeof value === 'string' && BRICK_TYPES.includes(value as BrickType)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<{
    name: string
    slug?: string
    brickIds?: string[]
    placements?: Array<{ brickId: string, sectionType: BrickType, order: number }>
    isPublished?: boolean
  }>(event)

  if (!body.name?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'CV name is required'
    })
  }

  // Generate slug from name if not provided
  let slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.name)

  // Check uniqueness and append suffix if needed
  const [existing] = await db.select().from(cvs).where(eq(cvs.slug, slug))
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const newCV: NewCV = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    slug,
    isPublished: body.isPublished ?? true
  }

  await db.insert(cvs).values(newCV)

  const normalizedPlacements = (body.placements || [])
    .filter(p => typeof p?.brickId === 'string' && p.brickId && isBrickType(p.sectionType))
    .sort((a, b) => a.order - b.order)
    .filter((placement, index, arr) => arr.findIndex(item => item.brickId === placement.brickId) === index)

  // Insert junction rows (placements preferred, brickIds as backward-compatible fallback)
  if (normalizedPlacements.length > 0) {
    const junctionRows: NewCVBrick[] = normalizedPlacements.map((placement, index) => ({
      id: crypto.randomUUID(),
      cvId: newCV.id,
      brickId: placement.brickId,
      sectionOrder: index,
      cvSectionType: placement.sectionType
    }))
    await db.insert(cvBricks).values(junctionRows)
  } else if (body.brickIds && body.brickIds.length > 0) {
    const junctionRows: NewCVBrick[] = body.brickIds.map((brickId, index) => ({
      id: crypto.randomUUID(),
      cvId: newCV.id,
      brickId,
      sectionOrder: index,
      cvSectionType: null
    }))
    await db.insert(cvBricks).values(junctionRows)
  }

  const [result] = await db.select().from(cvs).where(eq(cvs.id, newCV.id))
  return result
})
