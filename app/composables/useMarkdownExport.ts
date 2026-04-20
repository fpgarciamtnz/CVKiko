import type { Brick } from './useBricks'
import type { Settings } from './useSettings'
import { BRICK_TYPE_CONFIG, formatBrickDateRange, type BrickType } from '~/utils/brick-types'

function normalizeMarkdown(value: string): string {
  return value.replace(/\r\n/g, '\n').trim()
}

function createFilename(filename?: string): string {
  if (filename?.trim()) return filename.trim()
  return `cv-${new Date().toISOString().split('T')[0]}.md`
}

export function useMarkdownExport() {
  const { sectionTypeOrder, contentOverrides } = useCVBuilder()

  function generateMarkdown(
    settings: Settings | null,
    bricksByType: Record<BrickType, Brick[]>
  ): string {
    const lines: string[] = []
    const name = settings?.name || 'Your Name'

    lines.push(`# ${name}`)

    if (settings?.pronouns) {
      lines.push(`_${settings.pronouns}_`)
    }

    const academicLine = [
      settings?.academicTitle,
      settings?.department,
      settings?.institution
    ].filter(Boolean).join(', ')
    if (academicLine) {
      lines.push(academicLine)
    }

    const contactParts: string[] = []
    if (settings?.email) contactParts.push(settings.email)
    if (settings?.phone) contactParts.push(settings.phone)
    if (settings?.location) contactParts.push(settings.location)
    if (contactParts.length > 0) {
      lines.push(contactParts.join(' | '))
    }

    const linkParts: string[] = []
    if (settings?.linkedIn) linkParts.push(`[LinkedIn](${settings.linkedIn})`)
    if (settings?.github) linkParts.push(`[GitHub](${settings.github})`)
    if (settings?.website) linkParts.push(`[Website](${settings.website})`)
    if (settings?.orcid) linkParts.push(`[ORCID](https://orcid.org/${settings.orcid})`)
    if (linkParts.length > 0) {
      lines.push(linkParts.join(' | '))
    }

    if (settings?.summary?.trim()) {
      lines.push('', '## Summary', '', normalizeMarkdown(settings.summary))
    }

    const sectionOrder: BrickType[] = sectionTypeOrder.value.length > 0
      ? sectionTypeOrder.value
      : ['experience', 'education', 'project', 'skill', 'publication', 'custom']

    for (const type of sectionOrder) {
      const sectionBricks = bricksByType[type]
      if (!sectionBricks?.length) continue

      lines.push('', `## ${BRICK_TYPE_CONFIG[type].pluralLabel}`, '')

      for (const brick of sectionBricks) {
        const fm = brick.frontmatter || {}
        const content = normalizeMarkdown(contentOverrides.value[brick.id] || brick.content || '')
        const dateRange = formatBrickDateRange(brick)
        const subtitleParts = [String(fm.subtitle || '').trim(), String(fm.location || '').trim()].filter(Boolean)
        const subtitleLine = subtitleParts.join(' | ')

        lines.push(`### ${brick.title}`)

        if (subtitleLine) {
          lines.push(`_${subtitleLine}_`)
        }

        if (dateRange) {
          lines.push(`**Date:** ${dateRange}`)
        }

        if (content) {
          lines.push('', content)
        }

        if (brick.tags?.length) {
          lines.push('', `**Tags:** ${brick.tags.join(', ')}`)
        }

        if (typeof fm.url === 'string' && fm.url.trim()) {
          lines.push('', `[${fm.url}](${fm.url})`)
        }

        lines.push('')
      }
    }

    return lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  async function exportToMarkdown(
    settings: Settings | null,
    bricksByType: Record<BrickType, Brick[]>,
    filename?: string
  ) {
    const markdown = generateMarkdown(settings, bricksByType)
    const name = createFilename(filename)

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return markdown
    }

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)

    return markdown
  }

  return {
    generateMarkdown,
    exportToMarkdown
  }
}
