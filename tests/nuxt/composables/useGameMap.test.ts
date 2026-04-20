import { describe, it, expect } from 'vitest'
import type { Brick } from '../../../app/composables/useBricks'
import type { Settings } from '../../../app/composables/useSettings'

function makeBrick(id: string, type: string, isActive: boolean = true): Brick {
  return {
    id,
    type: type as Brick['type'],
    title: `Brick ${id}`,
    content: '',
    tags: [],
    frontmatter: {},
    structuredData: {},
    isActive,
    sortOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: '1',
    name: 'John Doe',
    email: null,
    phone: null,
    location: null,
    summary: null,
    linkedIn: null,
    github: null,
    website: null,
    orcid: null,
    pronouns: null,
    academicTitle: null,
    department: null,
    institution: null,
    updatedAt: null,
    ...overrides
  }
}

describe('useGameMap', () => {
  describe('hero zone', () => {
    it('always exists even with empty bricks', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      expect(townMap.value.zones.some(z => z.id === 'hero')).toBe(true)
    })

    it('uses settings name as hero label', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(makeSettings({ name: 'Jane' }))
      const { townMap } = useGameMap(bricks, settings)

      const hero = townMap.value.zones.find(z => z.id === 'hero')
      expect(hero?.label).toBe('Jane')
    })

    it('uses "Welcome" as fallback when no settings', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const hero = townMap.value.zones.find(z => z.id === 'hero')
      expect(hero?.label).toBe('Welcome')
    })
  })

  describe('contact zone', () => {
    it('exists when email is present', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(makeSettings({ email: 'test@test.com' }))
      const { townMap } = useGameMap(bricks, settings)

      expect(townMap.value.zones.some(z => z.id === 'contact')).toBe(true)
    })

    it('absent when no contact info', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(makeSettings())
      const { townMap } = useGameMap(bricks, settings)

      expect(townMap.value.zones.some(z => z.id === 'contact')).toBe(false)
    })
  })

  describe('spawn point', () => {
    it('is valid numbers', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      expect(townMap.value.spawnPoint.x).toBeGreaterThan(0)
      expect(townMap.value.spawnPoint.y).toBeGreaterThan(0)
    })
  })

  describe('districts', () => {
    it('creates districts for each unique brick type', () => {
      const bricks = ref<Brick[]>([
        makeBrick('1', 'experience'),
        makeBrick('2', 'education'),
        makeBrick('3', 'project')
      ])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      expect(townMap.value.districts).toHaveLength(3)
      const types = townMap.value.districts.map(d => d.type)
      expect(types).toContain('experience')
      expect(types).toContain('education')
      expect(types).toContain('project')
    })

    it('creates building zones per brick', () => {
      const bricks = ref<Brick[]>([
        makeBrick('1', 'experience'),
        makeBrick('2', 'experience')
      ])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const buildingZones = townMap.value.zones.filter(z => z.kind === 'building')
      expect(buildingZones).toHaveLength(2)
    })

    it('creates district-sign zones', () => {
      const bricks = ref<Brick[]>([
        makeBrick('1', 'experience'),
        makeBrick('2', 'education')
      ])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const signs = townMap.value.zones.filter(z => z.kind === 'district-sign')
      expect(signs).toHaveLength(2)
    })

    it('ignores inactive bricks', () => {
      const bricks = ref<Brick[]>([
        makeBrick('1', 'experience', true),
        makeBrick('2', 'experience', false)
      ])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const buildingZones = townMap.value.zones.filter(z => z.kind === 'building')
      expect(buildingZones).toHaveLength(1)
    })

    it('uses cvSectionType placement when provided', () => {
      const placedBrick = makeBrick('1', 'project')
      placedBrick.cvSectionType = 'experience'
      const bricks = ref<Brick[]>([placedBrick])
      const settings = ref<Settings | null>(null)
      const sectionOrder = ref<Brick['type'][]>(['experience', 'project'])
      const { townMap } = useGameMap(bricks, settings, sectionOrder)

      expect(townMap.value.districts[0]?.type).toBe('experience')
    })
  })

  describe('roads', () => {
    it('main vertical road is always present', () => {
      const bricks = ref<Brick[]>([])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const verticalRoads = townMap.value.roads.filter(r => r.x1 === r.x2)
      expect(verticalRoads.length).toBeGreaterThanOrEqual(1)
    })

    it('horizontal connector roads exist for districts', () => {
      const bricks = ref<Brick[]>([
        makeBrick('1', 'experience'),
        makeBrick('2', 'education')
      ])
      const settings = ref<Settings | null>(null)
      const { townMap } = useGameMap(bricks, settings)

      const horizontalRoads = townMap.value.roads.filter(r => r.y1 === r.y2)
      expect(horizontalRoads.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('world size', () => {
    it('grows with more bricks', () => {
      const smallBricks = ref<Brick[]>([makeBrick('1', 'experience')])
      const largeBricks = ref<Brick[]>([
        makeBrick('1', 'experience'),
        makeBrick('2', 'education'),
        makeBrick('3', 'project'),
        makeBrick('4', 'skill'),
        makeBrick('5', 'publication')
      ])
      const settings = ref<Settings | null>(null)

      const { townMap: small } = useGameMap(smallBricks, settings)
      const { townMap: large } = useGameMap(largeBricks, settings)

      expect(large.value.worldHeight).toBeGreaterThan(small.value.worldHeight)
    })
  })
})
