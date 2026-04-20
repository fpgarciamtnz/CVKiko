import { describe, it, expect, beforeEach } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { BrickType } from '../../../app/utils/brick-types'

function makeBrick(id: string, type: BrickType = 'experience'): Brick {
  return {
    id,
    type,
    title: `Brick ${id}`,
    content: '',
    tags: [],
    frontmatter: {},
    structuredData: {},
    isActive: true,
    sortOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
}

describe('useCVBuilder', () => {
  beforeEach(() => {
    const { bricks } = useBricks()
    bricks.value = [
      makeBrick('a', 'experience'),
      makeBrick('b', 'education'),
      makeBrick('c', 'project'),
      makeBrick('d', 'teaching')
    ]

    const {
      selectedBrickIds,
      brickOrder,
      brickPlacementById,
      sectionTypeOrder,
      cvConfig,
      contentOverrides
    } = useCVBuilder()

    selectedBrickIds.value = new Set()
    brickOrder.value = []
    brickPlacementById.value = {}
    sectionTypeOrder.value = ['experience', 'education', 'project', 'skill', 'publication', 'custom', 'teaching', 'grant', 'presentation', 'award', 'service']
    contentOverrides.value = {}
    cvConfig.value = { name: 'My CV' }
  })

  it('selects and deselects bricks while maintaining placement defaults', () => {
    const { selectedBrickIds, brickOrder, brickPlacementById, toggleBrick } = useCVBuilder()

    toggleBrick(makeBrick('a', 'experience'))
    expect(selectedBrickIds.value.has('a')).toBe(true)
    expect(brickOrder.value).toEqual(['a'])
    expect(brickPlacementById.value.a).toBe('experience')

    toggleBrick(makeBrick('a', 'experience'))
    expect(selectedBrickIds.value.has('a')).toBe(false)
    expect(brickOrder.value).toEqual([])
    expect(brickPlacementById.value.a).toBeUndefined()
  })

  it('batch selects without duplicates and assigns placement by brick type', () => {
    const { selectBricks, brickOrder, brickPlacementById } = useCVBuilder()

    selectBricks(['a', 'b'])
    selectBricks(['a', 'c'])

    expect(brickOrder.value).toEqual(['a', 'b', 'c'])
    expect(brickPlacementById.value).toMatchObject({
      a: 'experience',
      b: 'education',
      c: 'project'
    })
  })

  it('applies cross-section and within-section reordering', () => {
    const { selectBricks, applyPlacedSections, orderedPlacements, placedSections } = useCVBuilder()

    selectBricks(['a', 'b', 'c'])

    applyPlacedSections([
      { type: 'education', brickIds: ['c', 'b'] },
      { type: 'experience', brickIds: ['a'] },
      { type: 'project', brickIds: [] }
    ])

    expect(orderedPlacements.value.map(p => `${p.sectionType}:${p.brickId}`)).toEqual([
      'education:c',
      'education:b',
      'experience:a'
    ])

    const education = placedSections.value.find(s => s.type === 'education')
    expect(education?.brickIds).toEqual(['c', 'b'])
  })

  it('computes non-empty placed sections in section order', () => {
    const { selectBricks, applyPlacedSections, nonEmptyPlacedSections } = useCVBuilder()

    selectBricks(['a', 'b', 'c'])
    applyPlacedSections([
      { type: 'project', brickIds: ['c'] },
      { type: 'experience', brickIds: ['a'] },
      { type: 'education', brickIds: ['b'] }
    ])

    expect(nonEmptyPlacedSections.value.map(section => section.type)).toEqual(['project', 'experience', 'education'])
  })

  it('preserves selected placement types when switching CV mode', () => {
    const { selectBricks, applyPlacedSections, setCVMode, sectionTypeOrder } = useCVBuilder()

    selectBricks(['d'])
    applyPlacedSections([{ type: 'teaching', brickIds: ['d'] }])
    setCVMode('industry')

    expect(sectionTypeOrder.value.includes('teaching')).toBe(true)
  })

  it('merges content overrides by brick id', () => {
    const { applyContentOverride, applyContentOverrides, contentOverrides } = useCVBuilder()

    applyContentOverride('a', 'Override A')
    applyContentOverrides({ b: 'Override B' })

    expect(contentOverrides.value).toEqual({ a: 'Override A', b: 'Override B' })
  })
})
