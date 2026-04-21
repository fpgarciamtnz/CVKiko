import { useDb, settings } from '../../database'
import { eq } from 'drizzle-orm'

const DEFAULT_PDF_LAYOUT_RULE = {
  enforceOnePage: true,
  compactContactsInline: true,
  minScale: 0.72,
  targetPage: 'A4' as const
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  let [result] = await db.select().from(settings).where(eq(settings.id, 'default'))

  // Create default settings if none exist
  if (!result) {
    await db.insert(settings).values({
      id: 'default',
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedIn: '',
      github: '',
      website: '',
      orcid: '',
      pronouns: '',
      academicTitle: '',
      department: '',
      institution: '',
      pdfLayoutRule: DEFAULT_PDF_LAYOUT_RULE
    })
    ;[result] = await db.select().from(settings).where(eq(settings.id, 'default'))
  }

  if (!result) {
    throw createError({
      statusCode: 500,
      message: 'Failed to load default settings'
    })
  }

  if (!result.pdfLayoutRule || typeof result.pdfLayoutRule !== 'object') {
    result.pdfLayoutRule = DEFAULT_PDF_LAYOUT_RULE
  }

  return result
})
