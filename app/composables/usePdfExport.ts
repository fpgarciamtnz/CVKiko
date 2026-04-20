import type { jsPDF } from 'jspdf'
import type { Brick } from './useBricks'
import type { Settings } from './useSettings'
import {
  BRICK_TYPE_CONFIG,
  PUBLICATION_STATUSES,
  formatBrickDateRange,
  formatDateRange,
  type BrickType,
  type EducationData,
  type ExperienceData,
  type ProjectData,
  type PublicationData,
  type CustomData
} from '~/utils/brick-types'
import { stripMarkdown } from '~/utils/render-markdown'

type FontStyle = 'normal' | 'bold' | 'italic'
type ColorTuple = [number, number, number]

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

export function usePdfExport() {
  const { sectionTypeOrder, contentOverrides } = useCVBuilder()

  async function generateCV(
    settings: Settings | null,
    bricksByType: Record<BrickType, Brick[]>
  ): Promise<jsPDF> {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = PDF_THEME.marginX
    const marginY = PDF_THEME.marginY
    const contentWidth = pageWidth - (marginX * 2)
    let y = marginY

    doc.setTextColor(...PDF_THEME.colors.text)

    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - marginY) {
        doc.addPage()
        y = marginY
        doc.setTextColor(...PDF_THEME.colors.text)
      }
    }

    const writeWrapped = (
      text: string,
      options: {
        fontSize?: number
        fontStyle?: FontStyle
        lineHeight?: number
        color?: ColorTuple
        maxLines?: number
        seen?: Set<string>
        x?: number
      } = {}
    ) => {
      const normalized = normalizePlainText(text)
      if (!normalized) return

      const seen = options.seen
      if (seen) {
        const key = normalized.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
      }

      doc.setFontSize(options.fontSize ?? PDF_THEME.fontSize.body)
      doc.setFont('helvetica', options.fontStyle ?? 'normal')
      if (options.color) doc.setTextColor(...options.color)

      const lines = doc.splitTextToSize(normalized, contentWidth)
      const limitedLines = options.maxLines ? lines.slice(0, options.maxLines) : lines
      const lineHeight = options.lineHeight ?? PDF_THEME.lineHeight.normal
      const textX = options.x ?? marginX

      for (const line of limitedLines) {
        checkPageBreak(lineHeight + 1)
        doc.text(line, textX, y)
        y += lineHeight
      }

      if (options.color) doc.setTextColor(...PDF_THEME.colors.text)
    }

    const writeTitleRow = (title: string, dateText?: string, seen?: Set<string>) => {
      const normalizedTitle = normalizePlainText(title)
      if (!normalizedTitle) return

      const dedupeSet = seen
      if (dedupeSet) {
        const key = normalizedTitle.toLowerCase()
        if (dedupeSet.has(key)) return
        dedupeSet.add(key)
      }

      checkPageBreak(6.6)
      doc.setFontSize(PDF_THEME.fontSize.title)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...PDF_THEME.colors.text)
      doc.text(normalizedTitle, marginX, y)

      if (dateText) {
        const normalizedDate = normalizePlainText(dateText)
        if (normalizedDate) {
          doc.setFontSize(PDF_THEME.fontSize.subtitle)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(...PDF_THEME.colors.muted)
          const dateWidth = doc.getTextWidth(normalizedDate)
          doc.text(normalizedDate, pageWidth - marginX - dateWidth, y)
          doc.setTextColor(...PDF_THEME.colors.text)
        }
      }

      y += PDF_THEME.lineHeight.normal
    }

    const drawSectionDivider = () => {
      doc.setDrawColor(...PDF_THEME.colors.divider)
      doc.setLineWidth(0.35)
      doc.line(marginX, y, pageWidth - marginX, y)
      doc.setDrawColor(0, 0, 0)
    }

    // Header
    doc.setFontSize(PDF_THEME.fontSize.name)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_THEME.colors.text)
    doc.text(settings?.name || 'Your Name', marginX, y)
    y += PDF_THEME.spacing.headerNameBottom

    // Contact info
    doc.setFontSize(PDF_THEME.fontSize.contact)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...PDF_THEME.colors.muted)
    const contactParts: string[] = []
    if (settings?.email) contactParts.push(settings.email)
    if (settings?.phone) contactParts.push(settings.phone)
    if (settings?.location) contactParts.push(settings.location)

    if (contactParts.length > 0) {
      doc.text(contactParts.join('  |  '), marginX, y)
      y += PDF_THEME.lineHeight.normal
    }

    // Links
    const linkParts: string[] = []
    if (settings?.linkedIn) linkParts.push(settings.linkedIn)
    if (settings?.github) linkParts.push(settings.github)
    if (settings?.website) linkParts.push(settings.website)

    if (linkParts.length > 0) {
      doc.setTextColor(...PDF_THEME.colors.link)
      doc.text(linkParts.join('  |  '), marginX, y)
      doc.setTextColor(...PDF_THEME.colors.text)
      y += PDF_THEME.lineHeight.normal
    }

    y += PDF_THEME.spacing.headerLineGapTop
    drawSectionDivider()
    y += PDF_THEME.spacing.headerLineGapBottom

    // Summary
    if (settings?.summary) {
      y += PDF_THEME.spacing.summaryTop
      writeWrapped(settings.summary, {
        fontSize: PDF_THEME.fontSize.subtitle,
        fontStyle: 'normal',
        lineHeight: PDF_THEME.lineHeight.relaxed,
        color: PDF_THEME.colors.muted
      })
      y += PDF_THEME.spacing.summaryBottom
    }

    const sectionOrder: BrickType[] = sectionTypeOrder.value.length > 0
      ? sectionTypeOrder.value
      : ['experience', 'education', 'project', 'skill', 'publication', 'custom']

    for (const type of sectionOrder) {
      const typeBricks = bricksByType[type]
      if (!typeBricks?.length) continue

      checkPageBreak(16)

      y += PDF_THEME.spacing.sectionTop
      doc.setFontSize(PDF_THEME.fontSize.section)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...PDF_THEME.colors.heading)
      doc.text(BRICK_TYPE_CONFIG[type].pluralLabel.toUpperCase(), marginX, y)
      y += PDF_THEME.spacing.sectionHeaderBottom
      drawSectionDivider()
      y += PDF_THEME.spacing.sectionBodyTop
      doc.setTextColor(...PDF_THEME.colors.text)

      if (type === 'skill') {
        doc.setFontSize(PDF_THEME.fontSize.body)
        doc.setFont('helvetica', 'normal')
        const skills = typeBricks.map(b => b.title).filter(Boolean).join('  |  ')
        const skillLines = doc.splitTextToSize(skills, contentWidth)
        doc.text(skillLines, marginX, y)
        y += skillLines.length * PDF_THEME.lineHeight.normal + PDF_THEME.spacing.entryBottom
        continue
      }

      for (const brick of typeBricks) {
        checkPageBreak(22)

        const fm = brick.frontmatter
        const brickContent = contentOverrides.value[brick.id] || brick.content
        const seen = new Set<string>()

        if (type === 'education') {
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

          writeTitleRow(compactEducationLine, graduation, seen)
          y += PDF_THEME.spacing.entryBottom
          continue
        }

        if (type === 'publication') {
          const pub = (brick.structuredData || {}) as Partial<PublicationData>
          const title = normalizePlainText(pub.title || brick.title)
          writeTitleRow(`Article: ${title}`, undefined, seen)

          const status = pub.status
            ? PUBLICATION_STATUSES.find(s => s.value === pub.status)?.label || pub.status
            : ''
          const venueLine = uniqueNonEmpty([pub.publicationName || String(fm.subtitle || ''), status]).join(' | ')
          writeWrapped(venueLine, {
            fontSize: PDF_THEME.fontSize.subtitle,
            fontStyle: 'italic',
            color: PDF_THEME.colors.muted,
            seen
          })

          const publicationUrl = toDoiUrl(pub.url || pub.doi || String(fm.url || ''))
          writeWrapped(publicationUrl, {
            fontSize: PDF_THEME.fontSize.link,
            fontStyle: 'normal',
            color: PDF_THEME.colors.link,
            seen
          })

          y += PDF_THEME.spacing.entryBottom
          continue
        }

        if (type === 'project') {
          const proj = (brick.structuredData || {}) as Partial<ProjectData>
          writeTitleRow(proj.name || brick.title, undefined, seen)

          writeWrapped(proj.role || String(fm.subtitle || ''), {
            fontSize: PDF_THEME.fontSize.subtitle,
            fontStyle: 'italic',
            color: PDF_THEME.colors.muted,
            seen
          })
          writeWrapped(`Goal: ${proj.problem || proj.description || ''}`, {
            fontSize: PDF_THEME.fontSize.body,
            fontStyle: 'normal',
            maxLines: 2,
            seen
          })
          writeWrapped(`Outcome: ${proj.outcome || ''}`, {
            fontSize: PDF_THEME.fontSize.body,
            fontStyle: 'normal',
            maxLines: 2,
            seen
          })
          if (proj.technologies?.length) {
            writeWrapped(`Tech stack: ${uniqueNonEmpty(proj.technologies).join(', ')}`, {
              fontSize: PDF_THEME.fontSize.tag,
              fontStyle: 'normal',
              maxLines: 2,
              color: PDF_THEME.colors.muted,
              seen
            })
          }

          const projectUrl = proj.links?.find(link => link?.url)?.url || String(fm.url || '')
          writeWrapped(projectUrl, {
            fontSize: PDF_THEME.fontSize.link,
            fontStyle: 'normal',
            color: PDF_THEME.colors.link,
            seen
          })

          y += PDF_THEME.spacing.entryBottom
          continue
        }

        if (type === 'experience') {
          const exp = (brick.structuredData || {}) as Partial<ExperienceData>
          const dateStr = formatBrickDateRange(brick)

          const roleTitle = exp.jobTitle || brick.title
          writeTitleRow(roleTitle, dateStr, seen)

          const companyValue = exp.company || String(fm.subtitle || '')
          const company = includesIgnoreCase(roleTitle, companyValue) ? '' : companyValue
          const locationValue = exp.location || String(fm.location || '')
          const subtitleLine = uniqueNonEmpty([
            company,
            locationValue
          ]).join(' | ')
          writeWrapped(subtitleLine, {
            fontSize: PDF_THEME.fontSize.subtitle,
            fontStyle: 'italic',
            color: PDF_THEME.colors.muted,
            seen
          })

          const structuredHighlights = uniqueNonEmpty([
            ...(exp.responsibilities || []),
            ...(exp.achievements || [])
          ])
          const fallbackHighlights = uniqueNonEmpty(stripMarkdown(brickContent).split(/\r?\n+/))
            .filter(line => !/^responsibilities:?$/i.test(line) && !/^achievements:?$/i.test(line))
          const highlights = (structuredHighlights.length > 0 ? structuredHighlights : fallbackHighlights).slice(0, 3)

          highlights.forEach((item) => {
            writeWrapped(`- ${item}`, {
              fontSize: PDF_THEME.fontSize.body,
              fontStyle: 'normal',
              maxLines: 2,
              seen
            })
          })

          if (exp.technologies?.length) {
            writeWrapped(`Tech stack: ${uniqueNonEmpty(exp.technologies).join(', ')}`, {
              fontSize: PDF_THEME.fontSize.tag,
              fontStyle: 'normal',
              maxLines: 2,
              color: PDF_THEME.colors.muted,
              seen
            })
          }

          y += PDF_THEME.spacing.entryBottom
          continue
        }

        if (type === 'custom') {
          const custom = (brick.structuredData || {}) as Partial<CustomData>
          const dateStr = formatDateRange(
            custom.startDate || String(fm.startDate || ''),
            custom.isCurrent ? '' : (custom.endDate || String(fm.endDate || '')),
            type
          )
          writeTitleRow(brick.title, dateStr, seen)
          writeWrapped(custom.content || brickContent, {
            fontSize: PDF_THEME.fontSize.body,
            fontStyle: 'normal',
            maxLines: 4,
            seen
          })
          y += PDF_THEME.spacing.entryBottom
          continue
        }

        // Fallback for remaining brick types
        const dateStr = fm.startDate
          ? formatDateRange(String(fm.startDate), String(fm.endDate || ''), type)
          : ''

        writeTitleRow(brick.title, dateStr, seen)

        const subtitleParts = uniqueNonEmpty([String(fm.subtitle || ''), String(fm.location || '')]).join(' | ')
        writeWrapped(subtitleParts, {
          fontSize: PDF_THEME.fontSize.subtitle,
          fontStyle: 'italic',
          color: PDF_THEME.colors.muted,
          seen
        })

        writeWrapped(brickContent, {
          fontSize: PDF_THEME.fontSize.body,
          fontStyle: 'normal',
          maxLines: 4,
          seen
        })

        const url = String(fm.url || '')
        writeWrapped(url, {
          fontSize: PDF_THEME.fontSize.link,
          fontStyle: 'normal',
          color: PDF_THEME.colors.link,
          seen
        })

        y += PDF_THEME.spacing.entryBottom
      }
    }

    return doc
  }

  async function exportToPdf(
    settings: Settings | null,
    bricksByType: Record<BrickType, Brick[]>,
    filename?: string
  ) {
    const doc = await generateCV(settings, bricksByType)
    const name = filename || `cv-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(name)
  }

  async function getPreviewUrl(
    settings: Settings | null,
    bricksByType: Record<BrickType, Brick[]>
  ): Promise<string> {
    const doc = await generateCV(settings, bricksByType)
    return doc.output('datauristring')
  }

  return {
    generateCV,
    exportToPdf,
    getPreviewUrl
  }
}
