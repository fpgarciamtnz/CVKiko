import { describe, it, expect, beforeEach } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'

function makeBrick(id: string, type: string = 'experience'): Brick {
  return {
    id,
    type: type as any,
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
    // Populate shared useBricks state (both composables share useState)
    const { bricks } = useBricks()
    bricks.value = [
      makeBrick('a', 'experience'),
      makeBrick('b', 'education'),
      makeBrick('c', 'project')
    ]

    // Reset CVBuilder state
    const { selectedBrickIds, brickOrder, cvConfig } = useCVBuilder()
    selectedBrickIds.value = new Set()
    brickOrder.value = []
    cvConfig.value = { name: 'My CV' }
  })

  describe('toggleBrick', () => {
    it('selects an unselected brick', () => {
      const { selectedBrickIds, brickOrder, toggleBrick } = useCVBuilder()
      toggleBrick(makeBrick('a'))

      expect(selectedBrickIds.value.has('a')).toBe(true)
      expect(brickOrder.value).toContain('a')
    })

    it('deselects a selected brick', () => {
      const { selectedBrickIds, brickOrder, toggleBrick } = useCVBuilder()
      toggleBrick(makeBrick('a')) // select
      toggleBrick(makeBrick('a')) // deselect

      expect(selectedBrickIds.value.has('a')).toBe(false)
      expect(brickOrder.value).not.toContain('a')
    })

    it('preserves order (A then B)', () => {
      const { brickOrder, toggleBrick } = useCVBuilder()
      toggleBrick(makeBrick('a'))
      toggleBrick(makeBrick('b'))

      expect(brickOrder.value).toEqual(['a', 'b'])
    })
  })

  describe('selectBricks', () => {
    it('batch selects multiple bricks', () => {
      const { selectedBrickIds, brickOrder, selectBricks } = useCVBuilder()
      selectBricks(['a', 'b'])

      expect(selectedBrickIds.value.has('a')).toBe(true)
      expect(selectedBrickIds.value.has('b')).toBe(true)
      expect(brickOrder.value).toEqual(['a', 'b'])
    })

    it('does not add duplicates', () => {
      const { brickOrder, selectBricks } = useCVBuilder()
      selectBricks(['a'])
      selectBricks(['a', 'b'])

      expect(brickOrder.value.filter(id => id === 'a')).toHaveLength(1)
    })
  })

  describe('deselectAll', () => {
    it('clears all selections', () => {
      const { selectedBrickIds, brickOrder, selectBricks, deselectAll } = useCVBuilder()
      selectBricks(['a', 'b'])
      deselectAll()

      expect(selectedBrickIds.value.size).toBe(0)
      expect(brickOrder.value).toHaveLength(0)
    })
  })

  describe('reorderBricks', () => {
    it('replaces order array', () => {
      const { brickOrder, reorderBricks } = useCVBuilder()
      reorderBricks(['c', 'a', 'b'])
      expect(brickOrder.value).toEqual(['c', 'a', 'b'])
    })
  })

  describe('updateConfig', () => {
    it('merges partial config', () => {
      const { cvConfig, updateConfig } = useCVBuilder()
      updateConfig({ name: 'My Custom CV' })
      expect(cvConfig.value.name).toBe('My Custom CV')
    })

    it('preserves other fields', () => {
      const { cvConfig, updateConfig } = useCVBuilder()
      updateConfig({ name: 'Test CV' })
      updateConfig({ targetRole: 'Engineer' })

      expect(cvConfig.value.name).toBe('Test CV')
      expect(cvConfig.value.targetRole).toBe('Engineer')
    })
  })

  describe('selectedBricks computed', () => {
    it('returns Brick objects in order', () => {
      const { selectedBrickIds, brickOrder, selectedBricks } = useCVBuilder()
      selectedBrickIds.value = new Set(['b', 'a'])
      brickOrder.value = ['b', 'a']

      expect(selectedBricks.value.map(b => b.id)).toEqual(['b', 'a'])
    })

    it('filters out missing/unknown IDs', () => {
      const { selectedBrickIds, brickOrder, selectedBricks } = useCVBuilder()
      selectedBrickIds.value = new Set(['unknown-id'])
      brickOrder.value = ['unknown-id']

      expect(selectedBricks.value).toHaveLength(0)
    })
  })

  describe('selectedBricksByType computed', () => {
    it('groups bricks by type', () => {
      const { selectedBrickIds, brickOrder, selectedBricksByType } = useCVBuilder()
      selectedBrickIds.value = new Set(['a', 'b', 'c'])
      brickOrder.value = ['a', 'b', 'c']

      const grouped = selectedBricksByType.value
      expect(grouped.experience).toHaveLength(1)
      expect(grouped.education).toHaveLength(1)
      expect(grouped.project).toHaveLength(1)
    })
  })
})
