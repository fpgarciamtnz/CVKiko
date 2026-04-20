import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { Settings } from '../../../app/composables/useSettings'
import type { BrickType } from '../../../app/utils/brick-types'
import type { PlacedSection } from '../../../app/composables/useCVBuilder'
import { BRICK_TYPES } from '../../../app/utils/brick-types'

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

function emptyPlacementSections(): PlacedSection[] {
  return BRICK_TYPES.map(type => ({
    type,
    brickIds: [],
    bricks: []
  }))
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
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = {}
  })

  it('generates markdown with frontmatter, ordered sections, and brick content', () => {
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = { 'exp-1': '- Led migration\n- Reduced incidents' }

    const { generateMarkdown } = useMarkdownExport()
    const sections = emptyPlacementSections()

    const experienceSection = sections.find(section => section.type === 'experience')!
    experienceSection.bricks = [
      createBrick('exp-1', 'experience', 'Platform Engineer', '- Original content')
    ]
    experienceSection.brickIds = ['exp-1']

    const projectSection = sections.find(section => section.type === 'project')!
    projectSection.bricks = [
      createBrick('proj-1', 'project', 'Export Pipeline', 'Built dual export for PDF and Markdown.')
    ]
    projectSection.brickIds = ['proj-1']

    const markdown = generateMarkdown(mockSettings, sections)

    expect(markdown.startsWith('---\n')).toBe(true)
    expect(markdown).toContain('profile: ""')
    expect(markdown).toContain('target_position: ""')
    expect(markdown).toContain('target_keywords: []')
    expect(markdown).toContain('profile_generation_instructions:')
    expect(markdown).toContain('  en: |')
    expect(markdown).toContain('  es: |')
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
    const markdown = generateMarkdown(null, emptyPlacementSections())

    expect(markdown.startsWith('---\n')).toBe(true)
    expect(markdown).toContain('profile: ""')
    expect(markdown).toContain('# Your Name')
    expect(markdown).not.toContain('## Experiencia Profesional')
  })

  it('exports markdown as downloadable file', async () => {
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const { exportToMarkdown } = useMarkdownExport()
    const markdown = await exportToMarkdown(mockSettings, emptyPlacementSections(), 'my-cv.md')

    expect(markdown.startsWith('---\n')).toBe(true)
    expect(markdown).toContain('# Jane Doe')
    expect(createUrlSpy).toHaveBeenCalledTimes(1)
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:mock-url')
    expect(clickSpy).toHaveBeenCalledTimes(1)

    createUrlSpy.mockRestore()
    revokeUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })
})
