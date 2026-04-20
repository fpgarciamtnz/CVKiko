import type { Brick } from './useBricks'
import type { BrickType } from '~/utils/brick-types'
import { BRICK_TYPES } from '~/utils/brick-types'
import { CV_MODE_CONFIG, type CVMode } from '~/utils/cv-modes'

export type LayoutMode = 'grouped' | 'freeform'

export interface CVConfig {
  name: string
  targetRole?: string
  targetCompany?: string
  jobDescription?: string
}

export interface CVPlacement {
  brickId: string
  sectionType: BrickType
  order: number
}

export interface PlacedSection {
  type: BrickType
  brickIds: string[]
  bricks: Brick[]
}

const DEFAULT_SECTION_ORDER: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom']

function normalizeSectionOrder(order: BrickType[]): BrickType[] {
  const uniqueValid = Array.from(new Set(order.filter((type): type is BrickType => BRICK_TYPES.includes(type))))
  const missing = BRICK_TYPES.filter(type => !uniqueValid.includes(type))
  return [...uniqueValid, ...missing]
}

function normalizeBrickOrder(order: string[], selectedIds: Set<string>): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []

  for (const id of order) {
    if (!selectedIds.has(id) || seen.has(id)) continue
    seen.add(id)
    normalized.push(id)
  }

  return normalized
}

export function useCVBuilder() {
  const selectedBrickIds = useState<Set<string>>('cv-selected-bricks', () => new Set())
  const brickOrder = useState<string[]>('cv-brick-order', () => [])
  const orderedSectionsState = useState<BrickType[]>('cv-section-order', () => normalizeSectionOrder([...DEFAULT_SECTION_ORDER]))
  const brickPlacementById = useState<Record<string, BrickType>>('cv-brick-placement', () => ({}))
  const contentOverrides = useState<Record<string, string>>('cv-content-overrides', () => ({}))
  const cvConfig = useState<CVConfig>('cv-config', () => ({
    name: 'My CV'
  }))
  const layoutMode = useState<LayoutMode>('cv-layout-mode', () => 'grouped')
  const cvMode = useState<CVMode>('cv-mode', () => 'industry')

  const { bricks } = useBricks()

  const bricksById = computed(() => {
    return bricks.value.reduce((acc, brick) => {
      acc[brick.id] = brick
      return acc
    }, {} as Record<string, Brick>)
  })

  function inferSectionType(brickId: string): BrickType {
    const fromPlacement = brickPlacementById.value[brickId]
    if (fromPlacement) return fromPlacement

    const brickType = bricksById.value[brickId]?.type
    if (brickType) return brickType

    return 'custom'
  }

  function cleanupPlacementState() {
    const next: Record<string, BrickType> = {}
    for (const id of selectedBrickIds.value) {
      next[id] = inferSectionType(id)
    }
    brickPlacementById.value = next
  }

  function ensureSectionOrderSupportsSelection() {
    const requiredTypes = new Set<BrickType>()

    for (const id of selectedBrickIds.value) {
      requiredTypes.add(inferSectionType(id))
    }

    const preferred = orderedSectionsState.value.filter(type => requiredTypes.has(type))
    const remaining = orderedSectionsState.value.filter(type => !requiredTypes.has(type))
    const normalized = normalizeSectionOrder([...preferred, ...remaining])
    orderedSectionsState.value = normalized
  }

  const selectedBricks = computed(() => {
    const normalizedOrder = normalizeBrickOrder(brickOrder.value, selectedBrickIds.value)

    return normalizedOrder
      .map(id => bricksById.value[id])
      .filter((b): b is Brick => b !== undefined)
  })

  const selectedBricksByType = computed(() => {
    const grouped = selectedBricks.value.reduce((acc, brick) => {
      if (!acc[brick.type]) acc[brick.type] = []
      acc[brick.type].push(brick)
      return acc
    }, {} as Record<BrickType, Brick[]>)

    const ordered: Record<BrickType, Brick[]> = {} as Record<BrickType, Brick[]>
    for (const type of orderedSectionsState.value) {
      if (grouped[type]) ordered[type] = grouped[type]
    }

    return ordered
  })

  const placedSections = computed<PlacedSection[]>(() => {
    const buckets = BRICK_TYPES.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<BrickType, string[]>)

    const normalizedOrder = normalizeBrickOrder(brickOrder.value, selectedBrickIds.value)
    for (const id of normalizedOrder) {
      const brick = bricksById.value[id]
      if (!brick) continue
      const sectionType = inferSectionType(id)
      buckets[sectionType].push(id)
    }

    const sectionOrder = normalizeSectionOrder(orderedSectionsState.value)

    return sectionOrder.map((type) => {
      const brickIds = buckets[type]
      return {
        type,
        brickIds,
        bricks: brickIds.map(id => bricksById.value[id]).filter((b): b is Brick => b !== undefined)
      }
    })
  })

  const nonEmptyPlacedSections = computed(() => {
    return placedSections.value.filter(section => section.brickIds.length > 0)
  })

  const orderedPlacements = computed<CVPlacement[]>(() => {
    const placements: CVPlacement[] = []
    let order = 0

    for (const section of placedSections.value) {
      for (const brickId of section.brickIds) {
        placements.push({ brickId, sectionType: section.type, order })
        order++
      }
    }

    return placements
  })

  // Flat ordered bricks for freeform layout, based on placement section + item order.
  const flatOrderedBricks = computed(() => {
    return orderedPlacements.value
      .map(placement => bricksById.value[placement.brickId])
      .filter((b): b is Brick => b !== undefined)
  })

  function applyPlacedSections(sections: Array<{ type: BrickType, brickIds: string[] }>) {
    const selectedIds = new Set(selectedBrickIds.value)

    const nextSectionOrder: BrickType[] = []
    const seenSection = new Set<BrickType>()
    const seenBrick = new Set<string>()
    const nextOrder: string[] = []
    const nextPlacement = { ...brickPlacementById.value }

    for (const section of sections) {
      if (!BRICK_TYPES.includes(section.type) || seenSection.has(section.type)) continue

      seenSection.add(section.type)
      nextSectionOrder.push(section.type)

      for (const brickId of section.brickIds) {
        if (!selectedIds.has(brickId) || seenBrick.has(brickId)) continue
        seenBrick.add(brickId)
        nextOrder.push(brickId)
        nextPlacement[brickId] = section.type
      }
    }

    const normalizedCurrentOrder = normalizeBrickOrder(brickOrder.value, selectedIds)
    for (const brickId of normalizedCurrentOrder) {
      if (seenBrick.has(brickId)) continue
      seenBrick.add(brickId)
      nextOrder.push(brickId)
      nextPlacement[brickId] = inferSectionType(brickId)
    }

    brickOrder.value = nextOrder
    orderedSectionsState.value = normalizeSectionOrder([...nextSectionOrder, ...orderedSectionsState.value])

    const cleanedPlacement: Record<string, BrickType> = {}
    for (const brickId of selectedIds) {
      cleanedPlacement[brickId] = nextPlacement[brickId] || inferSectionType(brickId)
    }
    brickPlacementById.value = cleanedPlacement
  }

  function toggleBrick(brick: Brick) {
    if (selectedBrickIds.value.has(brick.id)) {
      selectedBrickIds.value.delete(brick.id)
      brickOrder.value = brickOrder.value.filter(id => id !== brick.id)
      const { [brick.id]: _, ...rest } = brickPlacementById.value
      brickPlacementById.value = rest
    } else {
      selectedBrickIds.value.add(brick.id)
      brickOrder.value = normalizeBrickOrder([...brickOrder.value, brick.id], selectedBrickIds.value)
      brickPlacementById.value = {
        ...brickPlacementById.value,
        [brick.id]: brickPlacementById.value[brick.id] || brick.type
      }
    }

    selectedBrickIds.value = new Set(selectedBrickIds.value)
    ensureSectionOrderSupportsSelection()
  }

  function selectBricks(brickIds: string[]) {
    let nextOrder = [...brickOrder.value]
    const nextPlacement = { ...brickPlacementById.value }

    for (const id of brickIds) {
      if (selectedBrickIds.value.has(id)) continue
      selectedBrickIds.value.add(id)
      nextOrder.push(id)

      const brick = bricksById.value[id]
      if (brick) {
        nextPlacement[id] = nextPlacement[id] || brick.type
      }
    }

    brickOrder.value = normalizeBrickOrder(nextOrder, selectedBrickIds.value)
    brickPlacementById.value = nextPlacement
    selectedBrickIds.value = new Set(selectedBrickIds.value)
    cleanupPlacementState()
    ensureSectionOrderSupportsSelection()
  }

  function deselectAll() {
    selectedBrickIds.value = new Set()
    brickOrder.value = []
    brickPlacementById.value = {}
  }

  function reorderBricks(newOrder: string[]) {
    brickOrder.value = normalizeBrickOrder(newOrder, selectedBrickIds.value)
    cleanupPlacementState()
  }

  function reorderSections(newOrder: BrickType[]) {
    orderedSectionsState.value = normalizeSectionOrder(newOrder)
  }

  function applySectionOrder(newOrder: BrickType[]) {
    reorderSections(newOrder)
  }

  function applyContentOverrides(overrides: Record<string, string>) {
    contentOverrides.value = { ...contentOverrides.value, ...overrides }
  }

  function applyContentOverride(brickId: string, content: string) {
    contentOverrides.value = { ...contentOverrides.value, [brickId]: content }
  }

  function removeContentOverride(brickId: string) {
    const { [brickId]: _, ...rest } = contentOverrides.value
    contentOverrides.value = rest
  }

  function updateConfig(updates: Partial<CVConfig>) {
    cvConfig.value = { ...cvConfig.value, ...updates }
  }

  function setCVMode(mode: CVMode) {
    cvMode.value = mode

    const requiredTypes = Array.from(new Set(
      Array.from(selectedBrickIds.value).map(id => inferSectionType(id))
    ))

    const next = [...CV_MODE_CONFIG[mode].defaultSectionOrder]
    for (const type of requiredTypes) {
      if (!next.includes(type)) next.push(type)
    }

    orderedSectionsState.value = normalizeSectionOrder(next)
  }

  function setLayoutMode(mode: LayoutMode) {
    layoutMode.value = mode
  }

  return {
    selectedBrickIds,
    brickOrder,
    sectionTypeOrder: orderedSectionsState,
    orderedSectionsState,
    brickPlacementById,
    contentOverrides,
    selectedBricks,
    selectedBricksByType,
    placedSections,
    nonEmptyPlacedSections,
    orderedPlacements,
    flatOrderedBricks,
    cvConfig,
    layoutMode,
    cvMode,
    toggleBrick,
    selectBricks,
    deselectAll,
    reorderBricks,
    reorderSections,
    applyPlacedSections,
    applySectionOrder,
    applyContentOverrides,
    applyContentOverride,
    removeContentOverride,
    updateConfig,
    setCVMode,
    setLayoutMode
  }
}
