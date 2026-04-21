import type { jsPDF } from 'jspdf'
import type { Settings } from './useSettings'
import { normalizePdfLayoutRule } from './useSettings'
import type { PlacedSection } from './useCVBuilder'
import {
  BRICK_TYPE_CONFIG,
  PUBLICATION_STATUSES,
  formatBrickDateRange,
  formatDateRange,
  type EducationData,
  type ExperienceData,
  type ProjectData,
  type PublicationData,
  type CustomData
} from '~/utils/brick-types'
import { stripMarkdown } from '~/utils/render-markdown'

type FontStyle = 'normal' | 'bold' | 'italic'
type ColorTuple = [number, number, number]

type NumericMap = Record<string, number>

interface PdfLayoutDiagnostics {
  usedScale: number
  compactionLevel: number
  overflowAtMinScale: boolean
  compactContactsInline: boolean
  enforceOnePage: boolean
}

interface PdfLayoutProfile {
  theme: typeof PDF_THEME
  scale: number
  compactionLevel: number
  compactContactsInline: boolean
  enforceOnePage: boolean
}

const COMPACTION_LEVELS = [
  { font: 1, line: 1, spacing: 1 },
  { font: 0.96, line: 0.95, spacing: 0.9 },
  { font: 0.92, line: 0.9, spacing: 0.82 },
  { font: 0.88, line: 0.86, spacing: 0.75 }
] as const

function normalizePlainText(value: string): string {
  return stripMarkdown(value).replace(/\s+/g, ' ').trim()
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values) {
    const normalized = normalizePlainText(value)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(normalized)
  }

  return unique
}

function toDoiUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('10.')) return `https://doi.org/${trimmed}`
  return trimmed
}

function includesIgnoreCase(text: string, part: string): boolean {
  const source = normalizePlainText(text).toLowerCase()
  const needle = normalizePlainText(part).toLowerCase()
  return !!needle && source.includes(needle)
}

const PDF_THEME = {
  marginX: 16,
  marginY: 16,
  colors: {
    text: [15, 23, 42] as ColorTuple,
    muted: [71, 85, 105] as ColorTuple,
    heading: [30, 41, 59] as ColorTuple,
    divider: [148, 163, 184] as ColorTuple,
    link: [30, 58, 138] as ColorTuple
  },
  fontSize: {
    name: 22,
    contact: 8.8,
    section: 10,
    title: 10.5,
    subtitle: 9,
    body: 8.8,
    link: 8.5,
    tag: 8
  },
  lineHeight: {
    compact: 3.6,
    normal: 4,
    relaxed: 4.2
  },
  spacing: {
    headerNameBottom: 8.5,
    headerLineGapTop: 2.2,
    headerLineGapBottom: 4.5,
    summaryTop: 1.8,
    summaryBottom: 2.5,
    sectionTop: 4.2,
    sectionHeaderBottom: 1.6,
    sectionBodyTop: 4.2,
    entryBottom: 2.3
  }
}

function scaleNumbers<T extends NumericMap>(source: T, multiplier: number): T {
  const next = {} as T
  for (const [key, value] of Object.entries(source)) {
    next[key as keyof T] = Number((value * multiplier).toFixed(3)) as T[keyof T]
  }
  return next
}

function buildProfile(
  compactionLevel: number,
  scale: number,
  options: { enforceOnePage: boolean, compactContactsInline: boolean }
): PdfLayoutProfile {
  const compaction = COMPACTION_LEVELS[compactionLevel] || COMPACTION_LEVELS[0]
  const compoundFont = compaction.font * scale
  const compoundLine = compaction.line * scale
  const compoundSpacing = compaction.spacing * scale

  return {
    scale,
    compactionLevel,
    enforceOnePage: options.enforceOnePage,
    compactContactsInline: options.compactContactsInline,
    theme: {
      ...PDF_THEME,
      marginX: Number((PDF_THEME.marginX * scale).toFixed(3)),
      marginY: Number((PDF_THEME.marginY * scale).toFixed(3)),
      fontSize: scaleNumbers(PDF_THEME.fontSize, compoundFont),
      lineHeight: scaleNumbers(PDF_THEME.lineHeight, compoundLine),
      spacing: scaleNumbers(PDF_THEME.spacing, compoundSpacing)
    }
  }
}

function runLayout(
  doc: jsPDF,
  settings: Settings | null,
  placementSections: PlacedSection[],
  contentOverrides: Record<string, string>,
  profile: PdfLayoutProfile,
  options: { measureOnly: boolean }
): { overflow: boolean } {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = profile.theme.marginX
  const marginY = profile.theme.marginY
  const contentWidth = pageWidth - (marginX * 2)
  let y = marginY
  let overflow = false

  doc.setTextColor(...profile.theme.colors.text)

  const checkPageBreak = (height: number): boolean => {
    if (y + height <= pageHeight - marginY) return true

    if (profile.enforceOnePage) {
      overflow = true
      return false
    }

    if (!options.measureOnly) {
      doc.addPage()
      doc.setTextColor(...profile.theme.colors.text)
    }
    y = marginY
    return true
  }

  const drawSectionDivider = () => {
    if (options.measureOnly) return
    doc.setDrawColor(...profile.theme.colors.divider)
    doc.setLineWidth(0.35)
    doc.line(marginX, y, pageWidth - marginX, y)
    doc.setDrawColor(0, 0, 0)
  }

  const writeWrapped = (
    text: string,
    optionsForText: {
      fontSize?: number
      fontStyle?: FontStyle
      lineHeight?: number
      color?: ColorTuple
      maxLines?: number
      seen?: Set<string>
      x?: number
    } = {}
  ): boolean => {
    const normalized = normalizePlainText(text)
    if (!normalized) return true

    const seen = optionsForText.seen
    if (seen) {
      const key = normalized.toLowerCase()
      if (seen.has(key)) return true
      seen.add(key)
    }

    doc.setFontSize(optionsForText.fontSize ?? profile.theme.fontSize.body)
    doc.setFont('helvetica', optionsForText.fontStyle ?? 'normal')
    if (optionsForText.color) doc.setTextColor(...optionsForText.color)

    const lines = doc.splitTextToSize(normalized, contentWidth)
    const canClamp = !profile.enforceOnePage && typeof optionsForText.maxLines === 'number'
    const limitedLines = canClamp ? lines.slice(0, optionsForText.maxLines) : lines
    const lineHeight = optionsForText.lineHeight ?? profile.theme.lineHeight.normal
    const textX = optionsForText.x ?? marginX

    for (const line of limitedLines) {
      if (!checkPageBreak(lineHeight + 1)) return false
      if (!options.measureOnly) doc.text(line, textX, y)
      y += lineHeight
    }

    if (optionsForText.color) doc.setTextColor(...profile.theme.colors.text)
    return true
  }

  const writeTitleRow = (title: string, dateText?: string, seen?: Set<string>): boolean => {
    const normalizedTitle = normalizePlainText(title)
    if (!normalizedTitle) return true

    const dedupeSet = seen
    if (dedupeSet) {
      const key = normalizedTitle.toLowerCase()
      if (dedupeSet.has(key)) return true
      dedupeSet.add(key)
    }

    if (!checkPageBreak(profile.theme.lineHeight.relaxed + 2)) return false
    doc.setFontSize(profile.theme.fontSize.title)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...profile.theme.colors.text)
    if (!options.measureOnly) doc.text(normalizedTitle, marginX, y)

    if (dateText) {
      const normalizedDate = normalizePlainText(dateText)
      if (normalizedDate) {
        doc.setFontSize(profile.theme.fontSize.subtitle)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...profile.theme.colors.muted)
        const dateWidth = doc.getTextWidth(normalizedDate)
        if (!options.measureOnly) doc.text(normalizedDate, pageWidth - marginX - dateWidth, y)
        doc.setTextColor(...profile.theme.colors.text)
      }
    }

    y += profile.theme.lineHeight.normal
    return true
  }

  const abortIfOverflow = () => profile.enforceOnePage && overflow

  doc.setFontSize(profile.theme.fontSize.name)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...profile.theme.colors.text)
  if (!options.measureOnly) doc.text(settings?.name || 'Your Name', marginX, y)
  y += profile.theme.spacing.headerNameBottom

  const contactParts: string[] = []
  if (settings?.email) contactParts.push(settings.email)
  if (settings?.phone) contactParts.push(settings.phone)
  if (settings?.location) contactParts.push(settings.location)

  const linkParts: string[] = []
  if (settings?.linkedIn) linkParts.push(settings.linkedIn)
  if (settings?.github) linkParts.push(settings.github)
  if (settings?.website) linkParts.push(settings.website)

  if (profile.compactContactsInline) {
    const contactAndLinks = [...contactParts, ...linkParts]
    if (contactAndLinks.length > 0) {
      if (!writeWrapped(contactAndLinks.join(' | '), {
        fontSize: profile.theme.fontSize.contact,
        fontStyle: 'normal',
        lineHeight: profile.theme.lineHeight.normal,
        color: profile.theme.colors.muted
      })) return { overflow: true }
    }
  } else {
    if (contactParts.length > 0) {
      if (!writeWrapped(contactParts.join(' | '), {
        fontSize: profile.theme.fontSize.contact,
        fontStyle: 'normal',
        lineHeight: profile.theme.lineHeight.normal,
        color: profile.theme.colors.muted
      })) return { overflow: true }
    }

    if (linkParts.length > 0) {
      if (!writeWrapped(linkParts.join(' | '), {
        fontSize: profile.theme.fontSize.link,
        fontStyle: 'normal',
        lineHeight: profile.theme.lineHeight.normal,
        color: profile.theme.colors.link
      })) return { overflow: true }
    }
  }

  y += profile.theme.spacing.headerLineGapTop
  if (!checkPageBreak(2)) return { overflow: true }
  drawSectionDivider()
  y += profile.theme.spacing.headerLineGapBottom

  if (settings?.summary) {
    y += profile.theme.spacing.summaryTop
    if (!writeWrapped(settings.summary, {
      fontSize: profile.theme.fontSize.subtitle,
      fontStyle: 'normal',
      lineHeight: profile.theme.lineHeight.relaxed,
      color: profile.theme.colors.muted
    })) return { overflow: true }
    y += profile.theme.spacing.summaryBottom
  }

  for (const section of placementSections) {
    const sectionBricks = section.bricks
    if (!sectionBricks.length) continue

    if (!checkPageBreak(16 * profile.scale)) break

    y += profile.theme.spacing.sectionTop
    doc.setFontSize(profile.theme.fontSize.section)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...profile.theme.colors.heading)
    if (!options.measureOnly) doc.text(BRICK_TYPE_CONFIG[section.type].pluralLabel.toUpperCase(), marginX, y)
    y += profile.theme.spacing.sectionHeaderBottom
    drawSectionDivider()
    y += profile.theme.spacing.sectionBodyTop
    doc.setTextColor(...profile.theme.colors.text)

    const skillBricks = sectionBricks.filter(brick => brick.type === 'skill')
    if (skillBricks.length > 0) {
      const skills = skillBricks.map(b => b.title).filter(Boolean).join(' | ')
      if (!writeWrapped(skills, {
        fontSize: profile.theme.fontSize.body,
        fontStyle: 'normal',
        lineHeight: profile.theme.lineHeight.normal
      })) return { overflow: true }
      y += profile.theme.spacing.entryBottom
    }

    for (const brick of sectionBricks.filter(item => item.type !== 'skill')) {
      if (!checkPageBreak(22 * profile.scale)) break

      const fm = brick.frontmatter
      const brickContent = contentOverrides[brick.id] || brick.content
      const seen = new Set<string>()
      const brickType = brick.type

      if (brickType === 'education') {
        const edu = (brick.structuredData || {}) as Partial<EducationData>
        const degree = edu.degree || brick.title
        const graduation = edu.graduationDate
          ? formatDateRange(edu.graduationDate, edu.isExpected ? '' : edu.graduationDate, 'education')
          : formatDateRange(fm.startDate as string, fm.endDate as string, 'education')

        const institutionValue = edu.institution || String(fm.subtitle || '')
        const fieldValue = edu.field || String(fm.field || '')
        const compactEducationLine = uniqueNonEmpty([
          degree,
          fieldValue && !includesIgnoreCase(degree, fieldValue) ? fieldValue : '',
          institutionValue && !includesIgnoreCase(degree, institutionValue) ? institutionValue : ''
        ]).join(' | ')

        if (!writeTitleRow(compactEducationLine, graduation, seen)) return { overflow: true }
        y += profile.theme.spacing.entryBottom
        continue
      }

      if (brickType === 'publication') {
        const pub = (brick.structuredData || {}) as Partial<PublicationData>
        const title = normalizePlainText(pub.title || brick.title)
        if (!writeTitleRow(`Article: ${title}`, undefined, seen)) return { overflow: true }

        const status = pub.status
          ? PUBLICATION_STATUSES.find(s => s.value === pub.status)?.label || pub.status
          : ''
        const venueLine = uniqueNonEmpty([pub.publicationName || String(fm.subtitle || ''), status]).join(' | ')
        if (!writeWrapped(venueLine, {
          fontSize: profile.theme.fontSize.subtitle,
          fontStyle: 'italic',
          color: profile.theme.colors.muted,
          seen
        })) return { overflow: true }

        const publicationUrl = toDoiUrl(pub.url || pub.doi || String(fm.url || ''))
        if (!writeWrapped(publicationUrl, {
          fontSize: profile.theme.fontSize.link,
          fontStyle: 'normal',
          color: profile.theme.colors.link,
          seen
        })) return { overflow: true }

        y += profile.theme.spacing.entryBottom
        continue
      }

      if (brickType === 'project') {
        const proj = (brick.structuredData || {}) as Partial<ProjectData>
        if (!writeTitleRow(proj.name || brick.title, undefined, seen)) return { overflow: true }

        if (!writeWrapped(proj.role || String(fm.subtitle || ''), {
          fontSize: profile.theme.fontSize.subtitle,
          fontStyle: 'italic',
          color: profile.theme.colors.muted,
          seen
        })) return { overflow: true }

        if (!writeWrapped(`Goal: ${proj.problem || proj.description || ''}`, {
          fontSize: profile.theme.fontSize.body,
          fontStyle: 'normal',
          maxLines: 2,
          seen
        })) return { overflow: true }

        if (!writeWrapped(`Outcome: ${proj.outcome || ''}`, {
          fontSize: profile.theme.fontSize.body,
          fontStyle: 'normal',
          maxLines: 2,
          seen
        })) return { overflow: true }

        if (proj.technologies?.length) {
          if (!writeWrapped(`Tech stack: ${uniqueNonEmpty(proj.technologies).join(', ')}`, {
            fontSize: profile.theme.fontSize.tag,
            fontStyle: 'normal',
            maxLines: 2,
            color: profile.theme.colors.muted,
            seen
          })) return { overflow: true }
        }

        const projectUrl = proj.links?.find(link => link?.url)?.url || String(fm.url || '')
        if (!writeWrapped(projectUrl, {
          fontSize: profile.theme.fontSize.link,
          fontStyle: 'normal',
          color: profile.theme.colors.link,
          seen
        })) return { overflow: true }

        y += profile.theme.spacing.entryBottom
        continue
      }

      if (brickType === 'experience') {
        const exp = (brick.structuredData || {}) as Partial<ExperienceData>
        const dateStr = formatBrickDateRange(brick)

        const roleTitle = exp.jobTitle || brick.title
        if (!writeTitleRow(roleTitle, dateStr, seen)) return { overflow: true }

        const companyValue = exp.company || String(fm.subtitle || '')
        const company = includesIgnoreCase(roleTitle, companyValue) ? '' : companyValue
        const locationValue = exp.location || String(fm.location || '')
        const subtitleLine = uniqueNonEmpty([
          company,
          locationValue
        ]).join(' | ')

        if (!writeWrapped(subtitleLine, {
          fontSize: profile.theme.fontSize.subtitle,
          fontStyle: 'italic',
          color: profile.theme.colors.muted,
          seen
        })) return { overflow: true }

        const structuredHighlights = uniqueNonEmpty([
          ...(exp.responsibilities || []),
          ...(exp.achievements || [])
        ])
        const fallbackHighlights = uniqueNonEmpty(stripMarkdown(brickContent).split(/\r?\n+/))
          .filter(line => !/^responsibilities:?$/i.test(line) && !/^achievements:?$/i.test(line))

        const highlightLimit = profile.enforceOnePage ? Number.POSITIVE_INFINITY : 3
        const highlights = (structuredHighlights.length > 0 ? structuredHighlights : fallbackHighlights).slice(0, highlightLimit)

        for (const item of highlights) {
          if (!writeWrapped(`- ${item}`, {
            fontSize: profile.theme.fontSize.body,
            fontStyle: 'normal',
            maxLines: 2,
            seen
          })) return { overflow: true }
        }

        if (exp.technologies?.length) {
          if (!writeWrapped(`Tech stack: ${uniqueNonEmpty(exp.technologies).join(', ')}`, {
            fontSize: profile.theme.fontSize.tag,
            fontStyle: 'normal',
            maxLines: 2,
            color: profile.theme.colors.muted,
            seen
          })) return { overflow: true }
        }

        y += profile.theme.spacing.entryBottom
        continue
      }

      if (brickType === 'custom') {
        const custom = (brick.structuredData || {}) as Partial<CustomData>
        const dateStr = formatDateRange(
          custom.startDate || String(fm.startDate || ''),
          custom.isCurrent ? '' : (custom.endDate || String(fm.endDate || '')),
          brickType
        )
        if (!writeTitleRow(brick.title, dateStr, seen)) return { overflow: true }

        if (!writeWrapped(custom.content || brickContent, {
          fontSize: profile.theme.fontSize.body,
          fontStyle: 'normal',
          maxLines: 4,
          seen
        })) return { overflow: true }

        y += profile.theme.spacing.entryBottom
        continue
      }

      const dateStr = fm.startDate
        ? formatDateRange(String(fm.startDate), String(fm.endDate || ''), brickType)
        : ''

      if (!writeTitleRow(brick.title, dateStr, seen)) return { overflow: true }

      const subtitleParts = uniqueNonEmpty([String(fm.subtitle || ''), String(fm.location || '')]).join(' | ')
      if (!writeWrapped(subtitleParts, {
        fontSize: profile.theme.fontSize.subtitle,
        fontStyle: 'italic',
        color: profile.theme.colors.muted,
        seen
      })) return { overflow: true }

      if (!writeWrapped(brickContent, {
        fontSize: profile.theme.fontSize.body,
        fontStyle: 'normal',
        maxLines: 4,
        seen
      })) return { overflow: true }

      const url = String(fm.url || '')
      if (!writeWrapped(url, {
        fontSize: profile.theme.fontSize.link,
        fontStyle: 'normal',
        color: profile.theme.colors.link,
        seen
      })) return { overflow: true }

      y += profile.theme.spacing.entryBottom

      if (abortIfOverflow()) return { overflow: true }
    }

    if (abortIfOverflow()) return { overflow: true }
  }

  return { overflow }
}

export function usePdfExport() {
  const { contentOverrides } = useCVBuilder()
  const lastLayoutDiagnostics = ref<PdfLayoutDiagnostics | null>(null)

  async function generateCV(
    settings: Settings | null,
    placementSections: PlacedSection[]
  ): Promise<jsPDF> {
    const { jsPDF } = await import('jspdf')
    const layoutRule = normalizePdfLayoutRule(settings?.pdfLayoutRule)
    const pageFormat = layoutRule.targetPage.toLowerCase() as 'a4'

    const makeDoc = () => new jsPDF({ unit: 'mm', format: pageFormat })

    const measureProfile = (profile: PdfLayoutProfile) => {
      const measureDoc = makeDoc()
      const result = runLayout(measureDoc, settings, placementSections, contentOverrides.value, profile, { measureOnly: true })
      return !result.overflow
    }

    let selectedProfile = buildProfile(0, 1, {
      enforceOnePage: layoutRule.enforceOnePage,
      compactContactsInline: layoutRule.compactContactsInline
    })
    let overflowAtMinScale = false

    if (layoutRule.enforceOnePage) {
      let foundProfile: PdfLayoutProfile | null = null

      for (let level = 0; level < COMPACTION_LEVELS.length; level++) {
        const candidate = buildProfile(level, 1, {
          enforceOnePage: true,
          compactContactsInline: layoutRule.compactContactsInline
        })

        if (measureProfile(candidate)) {
          foundProfile = candidate
          break
        }
      }

      if (foundProfile) {
        selectedProfile = foundProfile
      } else {
        const finalLevel = COMPACTION_LEVELS.length - 1
        const minScale = Math.min(1, Math.max(0.5, layoutRule.minScale))

        let low = minScale
        let high = 1
        let bestFitScale = minScale
        let hasBestFit = false

        for (let i = 0; i < 12; i++) {
          const mid = (low + high) / 2
          const candidate = buildProfile(finalLevel, mid, {
            enforceOnePage: true,
            compactContactsInline: layoutRule.compactContactsInline
          })

          if (measureProfile(candidate)) {
            hasBestFit = true
            bestFitScale = mid
            low = mid
          } else {
            high = mid
          }
        }

        if (!hasBestFit) {
          overflowAtMinScale = !measureProfile(buildProfile(finalLevel, minScale, {
            enforceOnePage: true,
            compactContactsInline: layoutRule.compactContactsInline
          }))
          selectedProfile = buildProfile(finalLevel, minScale, {
            enforceOnePage: true,
            compactContactsInline: layoutRule.compactContactsInline
          })
        } else {
          selectedProfile = buildProfile(finalLevel, bestFitScale, {
            enforceOnePage: true,
            compactContactsInline: layoutRule.compactContactsInline
          })
        }
      }
    }

    const doc = makeDoc()
    const renderResult = runLayout(doc, settings, placementSections, contentOverrides.value, selectedProfile, { measureOnly: false })

    if (layoutRule.enforceOnePage && renderResult.overflow) {
      overflowAtMinScale = true
      console.warn('PDF one-page compaction reached minimum layout profile; output may still be clipped.')
    }

    lastLayoutDiagnostics.value = {
      usedScale: selectedProfile.scale,
      compactionLevel: selectedProfile.compactionLevel,
      overflowAtMinScale,
      compactContactsInline: selectedProfile.compactContactsInline,
      enforceOnePage: selectedProfile.enforceOnePage
    }

    return doc
  }

  async function exportToPdf(
    settings: Settings | null,
    placementSections: PlacedSection[],
    filename?: string
  ) {
    const doc = await generateCV(settings, placementSections)
    const name = filename || `cv-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(name)
  }

  async function getPreviewUrl(
    settings: Settings | null,
    placementSections: PlacedSection[]
  ): Promise<string> {
    const doc = await generateCV(settings, placementSections)
    return doc.output('datauristring')
  }

  return {
    generateCV,
    exportToPdf,
    getPreviewUrl,
    lastLayoutDiagnostics
  }
}
