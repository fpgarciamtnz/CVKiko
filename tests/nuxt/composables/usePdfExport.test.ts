import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { Settings } from '../../../app/composables/useSettings'
import type { BrickType } from '../../../app/utils/brick-types'
import type { PlacedSection } from '../../../app/composables/useCVBuilder'
import { BRICK_TYPES } from '../../../app/utils/brick-types'

const capturedDocs: MockJsPDF[] = []

class MockJsPDF {
  internal = {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297
    }
  }

  lines: string[] = []
  savedFilename: string | null = null

  constructor() {
    capturedDocs.push(this)
  }

  setFontSize() {}

  setFont() {}

  setTextColor() {}

  setDrawColor() {}

  setLineWidth() {}

  line() {}

  addPage() {}

  splitTextToSize(text: string, maxLen: number): string[] {
    const normalized = String(text)
    if (normalized.length <= maxLen) return [normalized]
    const chunks = normalized.match(new RegExp(`.{1,${Math.max(1, Math.floor(maxLen))}}`, 'g'))
    return chunks || [normalized]
  }

  text(text: string | string[]) {
    if (Array.isArray(text)) {
      this.lines.push(...text.map(String))
      return
    }
    this.lines.push(String(text))
  }

  getTextWidth(text: string): number {
    return String(text).length * 1.6
  }

  output(format?: string): string {
    const content = this.lines.join('\n')
    if (format === 'datauristring') {
      return `data:application/pdf;mock,${encodeURIComponent(content)}`
    }
    return content
  }

  save(name: string) {
    this.savedFilename = name
  }
}

vi.mock('jspdf', () => ({
  jsPDF: MockJsPDF
}))

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
  summary: 'Senior engineer focused on product quality.',
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

describe('usePdfExport', () => {
  beforeEach(() => {
    capturedDocs.length = 0
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = {}
  })

  it('generates a PDF from placement sections', async () => {
    const { generateCV } = usePdfExport()
    const sections = emptyPlacementSections()

    const experienceSection = sections.find(section => section.type === 'experience')!
    experienceSection.bricks = [
      createBrick('exp-1', 'experience', 'Senior Engineer', '- Built scalable systems')
    ]
    experienceSection.brickIds = ['exp-1']

    const projectSection = sections.find(section => section.type === 'project')!
    projectSection.bricks = [
      createBrick('proj-1', 'project', 'Builder Revamp', 'Improved exports')
    ]
    projectSection.brickIds = ['proj-1']

    await generateCV(mockSettings, sections)

    expect(capturedDocs).toHaveLength(1)
    const output = capturedDocs[0]!.output()
    expect(output).toContain('Jane Doe')
    expect(output).toContain('EXPERIENCIA PROFESIONAL')
    expect(output).toContain('Senior Engineer')
  })

  it('includes content overrides in PDF output', async () => {
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = { 'exp-1': '- Delivered override result' }

    const { generateCV } = usePdfExport()
    const sections = emptyPlacementSections()

    const experienceSection = sections.find(section => section.type === 'experience')!
    experienceSection.bricks = [
      createBrick('exp-1', 'experience', 'Platform Engineer', '- Original text')
    ]
    experienceSection.brickIds = ['exp-1']

    await generateCV(mockSettings, sections)

    const output = capturedDocs[0]!.output()
    expect(output).toContain('Platform Engineer')
    expect(output).toContain('Delivered override result')
  })

  it('handles empty CV data gracefully', async () => {
    const { generateCV } = usePdfExport()

    await expect(generateCV(null, emptyPlacementSections())).resolves.toBeTruthy()
    expect(capturedDocs[0]!.output()).toContain('Your Name')
  })

  it('saves PDF with requested filename', async () => {
    const { exportToPdf } = usePdfExport()
    await exportToPdf(mockSettings, emptyPlacementSections(), 'my-cv.pdf')

    expect(capturedDocs[0]!.savedFilename).toBe('my-cv.pdf')
  })
})
