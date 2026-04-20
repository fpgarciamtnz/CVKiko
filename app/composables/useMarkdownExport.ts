import type { Settings } from './useSettings'
import type { PlacedSection } from './useCVBuilder'
import { BRICK_TYPE_CONFIG, formatBrickDateRange } from '~/utils/brick-types'

function normalizeMarkdown(value: string): string {
  return value.replace(/\r\n/g, '\n').trim()
}

function createFilename(filename?: string): string {
  if (filename?.trim()) return filename.trim()
  return `cv-${new Date().toISOString().split('T')[0]}.md`
}

export function useMarkdownExport() {
  const { contentOverrides } = useCVBuilder()

  function generateMarkdown(
    settings: Settings | null,
    placementSections: PlacedSection[]
  ): string {
    const lines: string[] = []
    const name = settings?.name || 'Your Name'

    lines.push(
      '---',
      'profile: ""',
      'target_position: ""',
      'target_keywords: []',
      'profile_generation_instructions:',
      '  en: |',
      '    Generate a tailored professional profile for the target_position.',
      '    Use only facts present in this CV.',
      '    Integrate relevant terms from target_keywords and the job description naturally.',
      '    Keep it concise (3-5 sentences), specific, and impact-oriented.',
      '    Do not invent achievements, responsibilities, or skills.',
      '  es: |',
      '    Genera un perfil profesional adaptado al target_position.',
      '    Usa solo hechos presentes en este CV.',
      '    Integra de forma natural terminos relevantes de target_keywords y de la descripcion del puesto.',
      '    Mantenlo conciso (3-5 frases), especifico y orientado a impacto.',
      '    No inventes logros, responsabilidades ni habilidades.',
      '---',
      ''
    )

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

    for (const section of placementSections) {
      if (!section.bricks.length) continue

      lines.push('', `## ${BRICK_TYPE_CONFIG[section.type].pluralLabel}`, '')

      for (const brick of section.bricks) {
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
    placementSections: PlacedSection[],
    filename?: string
  ) {
    const markdown = generateMarkdown(settings, placementSections)
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
