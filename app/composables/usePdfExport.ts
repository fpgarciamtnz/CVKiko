import type { jsPDF } from 'jspdf'
import type { Brick } from './useBricks'
import type { Settings } from './useSettings'
import { BRICK_TYPE_CONFIG, formatDateRange, type BrickType } from '~/utils/brick-types'
import { stripMarkdown } from '~/utils/render-markdown'

export function usePdfExport() {
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

    // Helper to check page break
    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    // Header - Name
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
      doc.setTextColor(0, 0, 238) // Blue for links
      doc.text(linkParts.join('  |  '), margin, y)
      doc.setTextColor(0, 0, 0) // Reset to black
      y += 8
    }

    // Summary
    if (settings?.summary) {
      y += 2
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const summaryLines = doc.splitTextToSize(stripMarkdown(settings.summary), contentWidth)
      doc.text(summaryLines, margin, y)
      y += summaryLines.length * 4 + 5
    }

    // Sections - use dynamic order from builder
    const { sectionTypeOrder, contentOverrides } = useCVBuilder()
    const sectionOrder: BrickType[] = sectionTypeOrder.value.length > 0
      ? sectionTypeOrder.value
      : ['experience', 'education', 'project', 'skill', 'publication']

    for (const type of sectionOrder) {
      const typeBricks = bricksByType[type]
      if (!typeBricks?.length) continue

      checkPageBreak(20)

      // Section header
      y += 5
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(BRICK_TYPE_CONFIG[type].pluralLabel.toUpperCase(), margin, y)
      y += 1
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
      y += 6

      // Skills rendered as a list
      if (type === 'skill') {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const skills = typeBricks.map(b => b.title).join('  •  ')
        const skillLines = doc.splitTextToSize(skills, contentWidth)
        doc.text(skillLines, margin, y)
        y += skillLines.length * 4 + 4
        continue
      }

      // Other sections
      for (const brick of typeBricks) {
        checkPageBreak(25)

        const fm = brick.frontmatter

        // Title and dates on same line
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        const title = brick.title
        doc.text(title, margin, y)

        if (fm.startDate) {
          const dateStr = formatDateRange(fm.startDate, fm.endDate)
          doc.setFont('helvetica', 'normal')
          const dateWidth = doc.getTextWidth(dateStr)
          doc.text(dateStr, pageWidth - margin - dateWidth, y)
        }
        y += 5

        // Subtitle (company/school)
        if (fm.subtitle) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'italic')
          let subtitleText = fm.subtitle
          if (fm.location) {
            subtitleText += ` | ${fm.location}`
          }
          doc.text(subtitleText, margin, y)
          y += 4
        }

        // Description - use content override if available, otherwise original content
        const brickContent = contentOverrides.value[brick.id] || brick.content
        if (brickContent) {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const descLines = doc.splitTextToSize(stripMarkdown(brickContent), contentWidth)
          // Limit to avoid overflow
          const maxLines = Math.min(descLines.length, 6)
          for (let i = 0; i < maxLines; i++) {
            checkPageBreak(5)
            doc.text(descLines[i], margin, y)
            y += 4
          }
        }

        // Tags
        if (brick.tags?.length) {
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          const tagsText = brick.tags.join(' • ')
          const tagLines = doc.splitTextToSize(tagsText, contentWidth)
          doc.text(tagLines[0], margin, y)
          doc.setTextColor(0, 0, 0)
          y += 4
        }

        // URL
        if (fm.url) {
          doc.setFontSize(9)
          doc.setTextColor(0, 0, 238)
          doc.text(fm.url, margin, y)
          doc.setTextColor(0, 0, 0)
          y += 4
        }

        y += 3 // spacing between bricks
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
