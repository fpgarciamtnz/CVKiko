import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { Settings } from '../../../app/composables/useSettings'
import type { BrickType } from '../../../app/utils/brick-types'

function createBrick(id: string, type: BrickType, title: string, content: string): Brick {
  return {
    id,
    type,
    title,
    content,
    tags: [],
    frontmatter: {},
    structuredData: {},
    isActive: true,
    sortOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
}

function emptyBricksByType(): Record<BrickType, Brick[]> {
  return {
    experience: [],
    education: [],
    project: [],
    skill: [],
    publication: [],
    custom: [],
    teaching: [],
    grant: [],
    presentation: [],
    award: [],
    service: []
  }
}

const mockSettings: Settings = {
  id: 'settings-1',
  name: 'Jane Doe',
  email: 'jane@doe.dev',
  phone: '+49 123 456',
  location: 'Berlin',
  summary: 'Senior engineer with a focus on reliable systems.',
  linkedIn: 'https://linkedin.com/in/janedoe',
  github: 'https://github.com/janedoe',
  website: 'https://janedoe.dev',
  orcid: null,
  pronouns: null,
  academicTitle: null,
  department: null,
  institution: null,
  updatedAt: '2026-01-01'
}

describe('useMarkdownExport', () => {
  beforeEach(() => {
    const { sectionTypeOrder, contentOverrides } = useCVBuilder()
    sectionTypeOrder.value = ['experience', 'project', 'skill', 'education', 'publication', 'custom']
    contentOverrides.value = {}
  })

  it('generates markdown with header, ordered sections, and brick content', () => {
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = { 'exp-1': '- Led migration\n- Reduced incidents' }

    const { generateMarkdown } = useMarkdownExport()
    const bricksByType = emptyBricksByType()
    bricksByType.experience = [
      createBrick('exp-1', 'experience', 'Platform Engineer', '- Original content')
    ]
    bricksByType.project = [
      createBrick('proj-1', 'project', 'Export Pipeline', 'Built dual export for PDF and Markdown.')
    ]
    bricksByType.skill = [
      createBrick('skill-1', 'skill', 'TypeScript', '')
    ]

    const markdown = generateMarkdown(mockSettings, bricksByType)

    expect(markdown).toContain('# Jane Doe')
    expect(markdown).toContain('jane@doe.dev | +49 123 456 | Berlin')
    expect(markdown).toContain('## Experiencia Profesional')
    expect(markdown).toContain('### Platform Engineer')
    expect(markdown).toContain('- Led migration')
    expect(markdown).toContain('## Proyectos')
    expect(markdown).toContain('### Export Pipeline')
    expect(markdown.indexOf('## Experiencia Profesional')).toBeLessThan(markdown.indexOf('## Proyectos'))
  })

  it('handles empty CV data gracefully', () => {
    const { generateMarkdown } = useMarkdownExport()
    const markdown = generateMarkdown(null, emptyBricksByType())

    expect(markdown).toContain('# Your Name')
    expect(markdown).not.toContain('## Experiencia Profesional')
  })

  it('exports markdown as downloadable file', async () => {
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const { exportToMarkdown } = useMarkdownExport()
    const markdown = await exportToMarkdown(mockSettings, emptyBricksByType(), 'my-cv.md')

    expect(markdown).toContain('# Jane Doe')
    expect(createUrlSpy).toHaveBeenCalledTimes(1)
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:mock-url')
    expect(clickSpy).toHaveBeenCalledTimes(1)

    createUrlSpy.mockRestore()
    revokeUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })
})
