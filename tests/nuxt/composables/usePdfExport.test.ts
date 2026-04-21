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
  addPageCalls = 0

  constructor() {
    capturedDocs.push(this)
  }

  setFontSize() {}

  setFont() {}

  setTextColor() {}

  setDrawColor() {}

  setLineWidth() {}

  line() {}

  addPage() {
    this.addPageCalls += 1
  }

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

function latestDoc(): MockJsPDF {
  return capturedDocs[capturedDocs.length - 1]!
}

const mockSettings: Settings = {
  id: 'settings-1',
  name: 'Jane Doe',
  email: 'jane@doe.dev',
  phone: '+49 123 456',
  location: 'Berlin',
  summary: 'Senior engineer focused on product quality.',
  linkedIn: 'ln/jd',
  github: 'gh/jd',
  website: 'jd.dev',
  orcid: null,
  pronouns: null,
  academicTitle: null,
  department: null,
  institution: null,
  pdfLayoutRule: {
    enforceOnePage: true,
    compactContactsInline: true,
    minScale: 0.72,
    targetPage: 'A4'
  },
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

    expect(capturedDocs.length).toBeGreaterThan(0)
    const output = latestDoc().output()
    expect(output).toContain('Jane Doe')
    expect(output).toContain('EXPERIENCIA PROFESIONAL')
    expect(output).toContain('Senior Engineer')
  })

  it('keeps strict one-page mode without adding new pages for large content', async () => {
    const { generateCV } = usePdfExport()
    const sections = emptyPlacementSections()

    const largeText = Array.from({ length: 30 }, (_, idx) => `- Impact bullet ${idx} ${'x'.repeat(120)}`).join('\n')
    const experienceSection = sections.find(section => section.type === 'experience')!
    experienceSection.bricks = Array.from({ length: 12 }, (_, idx) =>
      createBrick(`exp-${idx}`, 'experience', `Engineer ${idx}`, largeText)
    )
    experienceSection.brickIds = experienceSection.bricks.map(brick => brick.id)

    await generateCV(mockSettings, sections)

    expect(latestDoc().addPageCalls).toBe(0)
  })

  it('applies compaction pipeline and records diagnostics', async () => {
    const { generateCV, lastLayoutDiagnostics } = usePdfExport()
    const sections = emptyPlacementSections()

    const denseContent = `Impact ${'ship '.repeat(500)} ${'improved '.repeat(500)}`
    const experienceSection = sections.find(section => section.type === 'experience')!
    experienceSection.bricks = Array.from({ length: 12 }, (_, idx) =>
      createBrick(`exp-dense-${idx}`, 'experience', `Project ${idx}`, denseContent)
    )
    experienceSection.brickIds = experienceSection.bricks.map(brick => brick.id)

    await generateCV(mockSettings, sections)

    expect(lastLayoutDiagnostics.value).toBeTruthy()
    expect(lastLayoutDiagnostics.value!.compactionLevel).toBeGreaterThan(0)
    expect(lastLayoutDiagnostics.value!.enforceOnePage).toBe(true)
  })

  it('activates global scale fallback when spacing compaction is not enough', async () => {
    const { generateCV, lastLayoutDiagnostics } = usePdfExport()
    const sections = emptyPlacementSections()

    const longCustom = `${'A'.repeat(7000)} ENDTOKEN`
    const customSection = sections.find(section => section.type === 'custom')!
    customSection.bricks = Array.from({ length: 8 }, (_, idx) =>
      createBrick(`custom-${idx}`, 'custom', `Custom ${idx}`, longCustom)
    )
    customSection.brickIds = customSection.bricks.map(brick => brick.id)

    await generateCV({
      ...mockSettings,
      pdfLayoutRule: {
        ...mockSettings.pdfLayoutRule!,
        minScale: 0.72
      }
    }, sections)

    expect(lastLayoutDiagnostics.value!.usedScale).toBeLessThan(1)
  })

  it('renders contact and links in compact inline mode when enabled', async () => {
    const { generateCV } = usePdfExport()
    await generateCV(mockSettings, emptyPlacementSections())

    const output = latestDoc().output()
    expect(output).toContain('jane@doe.dev')
    expect(output).toContain('gh/jd')
    expect(output).toContain('ln/jd')
  })

  it('does not truncate content by maxLines in strict one-page mode', async () => {
    const { generateCV } = usePdfExport()
    const sections = emptyPlacementSections()

    const marker = 'TAIL_UNIQUE_MARKER_1977'
    const content = `${'Long block '.repeat(800)} ${marker}`
    const customSection = sections.find(section => section.type === 'custom')!
    customSection.bricks = [createBrick('custom-1', 'custom', 'Dense Narrative', content)]
    customSection.brickIds = ['custom-1']

    await generateCV(mockSettings, sections)

    const output = latestDoc().output()
    expect(output).toContain(marker)
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

    const output = latestDoc().output()
    expect(output).toContain('Platform Engineer')
    expect(output).toContain('Delivered override result')
  })

  it('handles empty CV data gracefully', async () => {
    const { generateCV } = usePdfExport()

    await expect(generateCV(null, emptyPlacementSections())).resolves.toBeTruthy()
    expect(latestDoc().output()).toContain('Your Name')
  })

  it('saves PDF with requested filename', async () => {
    const { exportToPdf } = usePdfExport()
    await exportToPdf(mockSettings, emptyPlacementSections(), 'my-cv.pdf')

    expect(latestDoc().savedFilename).toBe('my-cv.pdf')
  })
})
