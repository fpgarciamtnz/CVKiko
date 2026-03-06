import type { Brick } from './useBricks'
import type { BrickType } from '~/utils/brick-types'

export interface CVConfig {
  name: string
  targetRole?: string
  targetCompany?: string
  jobDescription?: string
}

const DEFAULT_SECTION_ORDER: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom']

export function useCVBuilder() {
  const selectedBrickIds = useState<Set<string>>('cv-selected-bricks', () => new Set())
  const brickOrder = useState<string[]>('cv-brick-order', () => [])
  const sectionTypeOrder = useState<BrickType[]>('cv-section-order', () => [...DEFAULT_SECTION_ORDER])
  const contentOverrides = useState<Record<string, string>>('cv-content-overrides', () => ({}))
  const cvConfig = useState<CVConfig>('cv-config', () => ({
    name: 'My CV'
  }))

  const { bricks } = useBricks()

  const selectedBricks = computed(() => {
    return brickOrder.value
      .map(id => bricks.value.find(b => b.id === id))
      .filter((b): b is Brick => b !== undefined)
  })

  const selectedBricksByType = computed(() => {
    const grouped = selectedBricks.value.reduce((acc, brick) => {
      if (!acc[brick.type]) acc[brick.type] = []
      acc[brick.type].push(brick)
      return acc
    }, {} as Record<BrickType, Brick[]>)

    // Return in section order
    const ordered: Record<BrickType, Brick[]> = {} as Record<BrickType, Brick[]>
    for (const type of sectionTypeOrder.value) {
      if (grouped[type]) {
        ordered[type] = grouped[type]
      }
    }
    return ordered
  })

  function toggleBrick(brick: Brick) {
    if (selectedBrickIds.value.has(brick.id)) {
      selectedBrickIds.value.delete(brick.id)
      brickOrder.value = brickOrder.value.filter(id => id !== brick.id)
    } else {
      selectedBrickIds.value.add(brick.id)
      brickOrder.value.push(brick.id)
    }
    // Force reactivity update
    selectedBrickIds.value = new Set(selectedBrickIds.value)
  }

  function selectBricks(brickIds: string[]) {
    brickIds.forEach((id) => {
      if (!selectedBrickIds.value.has(id)) {
        selectedBrickIds.value.add(id)
        brickOrder.value.push(id)
      }
    })
    selectedBrickIds.value = new Set(selectedBrickIds.value)
  }

  function deselectAll() {
    selectedBrickIds.value = new Set()
    brickOrder.value = []
  }

  function reorderBricks(newOrder: string[]) {
    brickOrder.value = newOrder
  }

  function reorderSections(newOrder: BrickType[]) {
    sectionTypeOrder.value = newOrder
  }

  function applySectionOrder(newOrder: BrickType[]) {
    sectionTypeOrder.value = newOrder
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

  return {
    selectedBrickIds,
    brickOrder,
    sectionTypeOrder,
    contentOverrides,
    selectedBricks,
    selectedBricksByType,
    cvConfig,
    toggleBrick,
    selectBricks,
    deselectAll,
    reorderBricks,
    reorderSections,
    applySectionOrder,
    applyContentOverrides,
    applyContentOverride,
    removeContentOverride,
    updateConfig
  }
}
