import { useDb, settings, type Settings } from '../../database'
import { eq } from 'drizzle-orm'

const DEFAULT_PDF_LAYOUT_RULE = {
  enforceOnePage: true,
  compactContactsInline: true,
  minScale: 0.72,
  targetPage: 'A4' as const
}

function normalizePdfLayoutRule(
  rule: unknown
): { enforceOnePage: boolean, compactContactsInline: boolean, minScale: number, targetPage: 'A4' } {
  const input = rule && typeof rule === 'object' ? rule as Partial<typeof DEFAULT_PDF_LAYOUT_RULE> : {}
  const minScale = Number(input.minScale)

  return {
    enforceOnePage: typeof input.enforceOnePage === 'boolean'
      ? input.enforceOnePage
      : DEFAULT_PDF_LAYOUT_RULE.enforceOnePage,
    compactContactsInline: typeof input.compactContactsInline === 'boolean'
      ? input.compactContactsInline
      : DEFAULT_PDF_LAYOUT_RULE.compactContactsInline,
    minScale: Number.isFinite(minScale)
      ? Math.min(1, Math.max(0.5, minScale))
      : DEFAULT_PDF_LAYOUT_RULE.minScale,
    targetPage: input.targetPage === 'A4'
      ? input.targetPage
      : DEFAULT_PDF_LAYOUT_RULE.targetPage
  }
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<Partial<Settings>>(event)
  const nextPdfLayoutRule = normalizePdfLayoutRule(body.pdfLayoutRule)

  // Ensure default settings exist
  const [existing] = await db.select().from(settings).where(eq(settings.id, 'default'))

  if (!existing) {
    await db.insert(settings).values({
      id: 'default',
      name: body.name ?? '',
      email: body.email ?? '',
      phone: body.phone ?? '',
      location: body.location ?? '',
      summary: body.summary ?? '',
      linkedIn: body.linkedIn ?? '',
      github: body.github ?? '',
      website: body.website ?? '',
      orcid: body.orcid ?? '',
      pronouns: body.pronouns ?? '',
      academicTitle: body.academicTitle ?? '',
      department: body.department ?? '',
      institution: body.institution ?? '',
      pdfLayoutRule: nextPdfLayoutRule
    })
  } else {
    await db.update(settings).set({
      ...body,
      pdfLayoutRule: nextPdfLayoutRule,
      updatedAt: new Date()
    }).where(eq(settings.id, 'default'))
  }

  const [result] = await db.select().from(settings).where(eq(settings.id, 'default'))
  if (!result.pdfLayoutRule || typeof result.pdfLayoutRule !== 'object') {
    result.pdfLayoutRule = DEFAULT_PDF_LAYOUT_RULE
  }
  return result
})
