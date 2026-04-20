import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { Settings } from '../../../app/composables/useSettings'
import type { BrickType } from '../../../app/utils/brick-types'

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
    const { sectionTypeOrder, contentOverrides } = useCVBuilder()
    sectionTypeOrder.value = ['experience', 'education', 'project', 'skill', 'publication', 'custom']
    contentOverrides.value = {}
  })

  it('generates a PDF from CV data', async () => {
    const { generateCV } = usePdfExport()
    const bricksByType = emptyBricksByType()
    bricksByType.experience = [
      createBrick('exp-1', 'experience', 'Senior Engineer', '- Built scalable systems')
    ]
    bricksByType.skill = [
      createBrick('skill-1', 'skill', 'TypeScript', '')
    ]

    await generateCV(mockSettings, bricksByType)

    expect(capturedDocs).toHaveLength(1)
    const output = capturedDocs[0]!.output()
    expect(output).toContain('Jane Doe')
    expect(output).toContain('EXPERIENCIA PROFESIONAL')
    expect(output).toContain('Senior Engineer')
  })

  it('includes selected bricks and content overrides in PDF output', async () => {
    const { contentOverrides } = useCVBuilder()
    contentOverrides.value = { 'exp-1': '- Delivered override result' }

    const { generateCV } = usePdfExport()
    const bricksByType = emptyBricksByType()
    bricksByType.experience = [
      createBrick('exp-1', 'experience', 'Platform Engineer', '- Original text')
    ]
    bricksByType.project = [
      createBrick('proj-1', 'project', 'Builder Revamp', 'Improved exports')
    ]

    await generateCV(mockSettings, bricksByType)

    const output = capturedDocs[0]!.output()
    expect(output).toContain('Platform Engineer')
    expect(output).toContain('Delivered override result')
    expect(output).toContain('Builder Revamp')
  })

  it('handles empty CV data gracefully', async () => {
    const { generateCV } = usePdfExport()

    await expect(generateCV(null, emptyBricksByType())).resolves.toBeTruthy()
    expect(capturedDocs[0]!.output()).toContain('Your Name')
  })

  it('saves PDF with requested filename', async () => {
    const { exportToPdf } = usePdfExport()
    await exportToPdf(mockSettings, emptyBricksByType(), 'my-cv.pdf')

    expect(capturedDocs[0]!.savedFilename).toBe('my-cv.pdf')
  })
})
