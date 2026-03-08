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
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let y = margin

    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    const writeWrapped = (
      text: string,
      options: {
        fontSize?: number
        fontStyle?: FontStyle
        lineHeight?: number
        color?: [number, number, number]
        maxLines?: number
        seen?: Set<string>
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

      doc.setFontSize(options.fontSize ?? 10)
      doc.setFont('helvetica', options.fontStyle ?? 'normal')
      if (options.color) doc.setTextColor(...options.color)

      const lines = doc.splitTextToSize(normalized, contentWidth)
      const limitedLines = options.maxLines ? lines.slice(0, options.maxLines) : lines
      const lineHeight = options.lineHeight ?? 4

      for (const line of limitedLines) {
        checkPageBreak(lineHeight + 1)
        doc.text(line, margin, y)
        y += lineHeight
      }

      if (options.color) doc.setTextColor(0, 0, 0)
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

      checkPageBreak(7)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(normalizedTitle, margin, y)

      if (dateText) {
        const normalizedDate = normalizePlainText(dateText)
        if (normalizedDate) {
          doc.setFont('helvetica', 'normal')
          const dateWidth = doc.getTextWidth(normalizedDate)
          doc.text(normalizedDate, pageWidth - margin - dateWidth, y)
        }
      }

      y += 5
    }

    // Header
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(settings?.name || 'Your Name', margin, y)
    y += 10

    // Contact info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const contactParts: string[] = []
    if (settings?.email) contactParts.push(settings.email)
    if (settings?.phone) contactParts.push(settings.phone)
    if (settings?.location) contactParts.push(settings.location)

    if (contactParts.length > 0) {
      doc.text(contactParts.join('  |  '), margin, y)
      y += 5
    }

    // Links
    const linkParts: string[] = []
    if (settings?.linkedIn) linkParts.push(settings.linkedIn)
    if (settings?.github) linkParts.push(settings.github)
    if (settings?.website) linkParts.push(settings.website)

    if (linkParts.length > 0) {
      doc.setTextColor(0, 0, 238)
      doc.text(linkParts.join('  |  '), margin, y)
      doc.setTextColor(0, 0, 0)
      y += 8
    }

    // Summary
    if (settings?.summary) {
      y += 2
      writeWrapped(settings.summary, { fontSize: 10, fontStyle: 'normal', lineHeight: 4 })
      y += 3
    }

    const sectionOrder: BrickType[] = sectionTypeOrder.value.length > 0
      ? sectionTypeOrder.value
      : ['experience', 'education', 'project', 'skill', 'publication', 'custom']

    for (const type of sectionOrder) {
      const typeBricks = bricksByType[type]
      if (!typeBricks?.length) continue

      checkPageBreak(20)

      y += 5
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(BRICK_TYPE_CONFIG[type].pluralLabel.toUpperCase(), margin, y)
      y += 1
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6

      if (type === 'skill') {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const skills = typeBricks.map(b => b.title).filter(Boolean).join('  -  ')
        const skillLines = doc.splitTextToSize(skills, contentWidth)
        doc.text(skillLines, margin, y)
        y += skillLines.length * 4 + 4
        continue
      }

      for (const brick of typeBricks) {
        checkPageBreak(25)

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
          y += 3
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
          writeWrapped(venueLine, { fontSize: 10, fontStyle: 'italic', seen })

          const publicationUrl = toDoiUrl(pub.url || pub.doi || String(fm.url || ''))
          writeWrapped(publicationUrl, {
            fontSize: 9,
            fontStyle: 'normal',
            color: [0, 0, 238],
            seen
          })

          y += 3
          continue
        }

        if (type === 'project') {
          const proj = (brick.structuredData || {}) as Partial<ProjectData>
          writeTitleRow(proj.name || brick.title, undefined, seen)

          writeWrapped(proj.role || String(fm.subtitle || ''), { fontSize: 10, fontStyle: 'italic', seen })
          writeWrapped(`Goal: ${proj.problem || proj.description || ''}`, {
            fontSize: 9,
            fontStyle: 'normal',
            maxLines: 2,
            seen
          })
          writeWrapped(`Outcome: ${proj.outcome || ''}`, {
            fontSize: 9,
            fontStyle: 'normal',
            maxLines: 2,
            seen
          })
          if (proj.technologies?.length) {
            writeWrapped(`Tech stack: ${uniqueNonEmpty(proj.technologies).join(', ')}`, {
              fontSize: 9,
              fontStyle: 'normal',
              maxLines: 2,
              seen
            })
          }

          const projectUrl = proj.links?.find(link => link?.url)?.url || String(fm.url || '')
          writeWrapped(projectUrl, {
            fontSize: 9,
            fontStyle: 'normal',
            color: [0, 0, 238],
            seen
          })

          y += 3
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
          writeWrapped(subtitleLine, { fontSize: 10, fontStyle: 'italic', seen })

          const structuredHighlights = uniqueNonEmpty([
            ...(exp.responsibilities || []),
            ...(exp.achievements || [])
          ])
          const fallbackHighlights = uniqueNonEmpty(stripMarkdown(brickContent).split(/\r?\n+/))
            .filter(line => !/^responsibilities:?$/i.test(line) && !/^achievements:?$/i.test(line))
          const highlights = (structuredHighlights.length > 0 ? structuredHighlights : fallbackHighlights).slice(0, 3)

          highlights.forEach((item) => {
            writeWrapped(`- ${item}`, { fontSize: 9, fontStyle: 'normal', maxLines: 2, seen })
          })

          if (exp.technologies?.length) {
            writeWrapped(`Tech stack: ${uniqueNonEmpty(exp.technologies).join(', ')}`, {
              fontSize: 9,
              fontStyle: 'normal',
              maxLines: 2,
              seen
            })
          }

          y += 3
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
            fontSize: 10,
            fontStyle: 'normal',
            maxLines: 4,
            seen
          })
          y += 3
          continue
        }

        // Fallback for remaining brick types
        const dateStr = fm.startDate
          ? formatDateRange(String(fm.startDate), String(fm.endDate || ''), type)
          : ''

        writeTitleRow(brick.title, dateStr, seen)

        const subtitleParts = uniqueNonEmpty([String(fm.subtitle || ''), String(fm.location || '')]).join(' | ')
        writeWrapped(subtitleParts, { fontSize: 10, fontStyle: 'italic', seen })

        writeWrapped(brickContent, {
          fontSize: 10,
          fontStyle: 'normal',
          maxLines: 4,
          seen
        })

        const url = String(fm.url || '')
        writeWrapped(url, {
          fontSize: 9,
          fontStyle: 'normal',
          color: [0, 0, 238],
          seen
        })

        y += 3
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
