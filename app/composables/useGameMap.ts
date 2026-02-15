import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { BrickType } from '~/utils/brick-types'
import { BRICK_TYPE_CONFIG } from '~/utils/brick-types'
import type { MapZone, RoadSegment, TownMap } from '~/utils/map-data'
import { ZONE_COLORS } from '~/utils/map-data'

const SECTION_ORDER: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom']

/**
 * Grid layout:
 *   [Hero]       --- [Experience]
 *     |                  |
 *   [Education]  --- [Projects]
 *     |                  |
 *   [Skills]     --- [Contact]
 */
const GRID_POSITIONS: { col: number, row: number }[] = [
  { col: 0, row: 0 }, // Hero
  { col: 1, row: 0 }, // first brick type
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 0, row: 2 },
  { col: 1, row: 2 },
  { col: 0, row: 3 },
  { col: 1, row: 3 }
]

const ZONE_WIDTH = 200
const ZONE_HEIGHT = 140
const COL_SPACING = 600
const ROW_SPACING = 500
const ROAD_WIDTH = 60
const MARGIN = 400

export function useGameMap(bricks: Ref<Brick[]>, settings: Ref<Settings | null>) {
  const townMap = computed<TownMap>(() => {
    const zones: MapZone[] = []
    const roads: RoadSegment[] = []

    // Collect active sections
    const sectionDefs: { id: string, type: 'hero' | 'contact' | BrickType, label: string, icon: string, bricks: Brick[] }[] = []

    // Hero
    sectionDefs.push({
      id: 'hero',
      type: 'hero',
      label: settings.value?.name || 'Welcome',
      icon: 'i-lucide-user',
      bricks: []
    })

    // Brick sections
    for (const type of SECTION_ORDER) {
      const typeBricks = bricks.value.filter(b => b.type === type && b.isActive)
      if (typeBricks.length === 0) continue
      sectionDefs.push({
        id: type,
        type,
        label: BRICK_TYPE_CONFIG[type].pluralLabel,
        icon: BRICK_TYPE_CONFIG[type].icon,
        bricks: typeBricks
      })
    }

    // Contact
    const s = settings.value
    if (s?.email || s?.phone || s?.linkedIn || s?.github) {
      sectionDefs.push({
        id: 'contact',
        type: 'contact',
        label: 'Contact',
        icon: 'i-lucide-mail',
        bricks: []
      })
    }

    // Place zones on grid
    for (let i = 0; i < sectionDefs.length; i++) {
      const def = sectionDefs[i]!
      const gridPos = GRID_POSITIONS[i] || { col: i % 2, row: Math.floor(i / 2) }
      const cx = MARGIN + gridPos.col * COL_SPACING
      const cy = MARGIN + gridPos.row * ROW_SPACING

      zones.push({
        id: def.id,
        type: def.type,
        label: def.label,
        icon: def.icon,
        cx,
        cy,
        width: ZONE_WIDTH,
        height: ZONE_HEIGHT,
        color: ZONE_COLORS[def.type] || 0x95a5a6,
        bricks: def.bricks
      })
    }

    // Connect zones with roads
    // Horizontal roads (same row, adjacent columns)
    // Vertical roads (same column, adjacent rows)
    const zoneGrid = new Map<string, MapZone>()
    for (let i = 0; i < zones.length; i++) {
      const gridPos = GRID_POSITIONS[i] || { col: i % 2, row: Math.floor(i / 2) }
      zoneGrid.set(`${gridPos.col},${gridPos.row}`, zones[i]!)
    }

    for (let i = 0; i < zones.length; i++) {
      const gridPos = GRID_POSITIONS[i] || { col: i % 2, row: Math.floor(i / 2) }
      // Right neighbor
      const rightKey = `${gridPos.col + 1},${gridPos.row}`
      const right = zoneGrid.get(rightKey)
      if (right) {
        roads.push({
          x1: zones[i]!.cx + ZONE_WIDTH / 2,
          y1: zones[i]!.cy,
          x2: right.cx - ZONE_WIDTH / 2,
          y2: right.cy,
          width: ROAD_WIDTH
        })
      }
      // Bottom neighbor
      const bottomKey = `${gridPos.col},${gridPos.row + 1}`
      const bottom = zoneGrid.get(bottomKey)
      if (bottom) {
        roads.push({
          x1: zones[i]!.cx,
          y1: zones[i]!.cy + ZONE_HEIGHT / 2,
          x2: bottom.cx,
          y2: bottom.cy - ZONE_HEIGHT / 2,
          width: ROAD_WIDTH
        })
      }
    }

    // Calculate world dimensions
    const maxCol = zones.reduce((max, _z, i) => {
      const gp = GRID_POSITIONS[i] || { col: i % 2 }
      return Math.max(max, gp.col)
    }, 0)
    const maxRow = zones.reduce((max, _z, i) => {
      const gp = GRID_POSITIONS[i] || { row: Math.floor(i / 2) }
      return Math.max(max, gp.row)
    }, 0)

    const worldWidth = MARGIN * 2 + maxCol * COL_SPACING + ZONE_WIDTH
    const worldHeight = MARGIN * 2 + maxRow * ROW_SPACING + ZONE_HEIGHT

    // Spawn at hero zone
    const heroZone = zones[0]
    const spawnPoint = heroZone
      ? { x: heroZone.cx, y: heroZone.cy + ZONE_HEIGHT / 2 + 60 }
      : { x: MARGIN, y: MARGIN + 150 }

    return { worldWidth, worldHeight, zones, roads, spawnPoint }
  })

  return { townMap }
}
