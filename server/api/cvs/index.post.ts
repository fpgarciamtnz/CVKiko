import { useDb, cvs, cvBricks, type NewCV, type NewCVBrick } from '../../database'
import { eq } from 'drizzle-orm'

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

  // Insert junction rows
  if (body.brickIds && body.brickIds.length > 0) {
    const junctionRows: NewCVBrick[] = body.brickIds.map((brickId, index) => ({
      id: crypto.randomUUID(),
      cvId: newCV.id,
      brickId,
      sectionOrder: index
    }))
    await db.insert(cvBricks).values(junctionRows)
  }

  const [result] = await db.select().from(cvs).where(eq(cvs.id, newCV.id))
  return result
})
