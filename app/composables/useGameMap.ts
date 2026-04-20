import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { BrickType } from '~/utils/brick-types'
import { BRICK_TYPE_CONFIG, BRICK_TYPES } from '~/utils/brick-types'
import type { District, MapZone, RoadSegment, TownMap } from '~/utils/map-data'
import { BUILDING_SIZES, ZONE_COLORS } from '~/utils/map-data'

const DEFAULT_SECTION_ORDER: BrickType[] = [...BRICK_TYPES]

const ROAD_WIDTH = 60
const MARGIN = 400
const MAIN_ROAD_X = 800 // x-center of the main vertical road
const DISTRICT_OFFSET_X = 350 // how far left/right districts sit from main road
const DISTRICT_GAP_Y = 400 // vertical gap between district rows
const BUILDING_GAP = 30 // gap between buildings within a district
const SKILL_COLS = 5 // grid columns for skills

export function useGameMap(bricks: Ref<Brick[]>, settings: Ref<Settings | null>, sectionOrder?: Ref<BrickType[]>) {
  const townMap = computed<TownMap>(() => {
    const zones: MapZone[] = []
    const roads: RoadSegment[] = []
    const districts: District[] = []

    // --- Hero zone at top center ---
    const heroSize = BUILDING_SIZES.hero
    const heroY = MARGIN
    const heroZone: MapZone = {
      id: 'hero',
      type: 'hero',
      label: settings.value?.name || 'Welcome',
      icon: 'i-lucide-user',
      cx: MAIN_ROAD_X,
      cy: heroY,
      width: heroSize.width,
      height: heroSize.height,
      color: ZONE_COLORS.hero!,
      kind: 'settings-zone',
      bricks: []
    }
    zones.push(heroZone)

    // --- Group bricks by type ---
    let currentY = heroY + heroSize.height / 2 + DISTRICT_GAP_Y
    let sideIndex = 0 // alternates left (0) / right (1)

    const sectionTypesFromBricks = Array.from(new Set(
      bricks.value
        .filter(brick => brick.isActive)
        .map(brick => brick.cvSectionType || brick.type)
    ))
    const requestedOrder = sectionOrder?.value || []
    const normalizedSectionOrder = [
      ...requestedOrder.filter(type => BRICK_TYPES.includes(type)),
      ...sectionTypesFromBricks.filter(type => !requestedOrder.includes(type)),
      ...DEFAULT_SECTION_ORDER.filter(type => !requestedOrder.includes(type) && !sectionTypesFromBricks.includes(type))
    ]

    for (const type of normalizedSectionOrder) {
      const typeBricks = bricks.value.filter(b => (b.cvSectionType || b.type) === type && b.isActive)
      if (typeBricks.length === 0) continue

      const config = BRICK_TYPE_CONFIG[type]
      const color = ZONE_COLORS[type] || 0x95a5a6
      const isSkill = type === 'skill'
      const bSize = isSkill ? BUILDING_SIZES.skill : BUILDING_SIZES.standard

      // Determine district side: left or right of main road
      const side = sideIndex % 2 === 0 ? -1 : 1 // -1 = left, 1 = right
      const districtCenterX = MAIN_ROAD_X + side * DISTRICT_OFFSET_X

      // Create district sign zone
      const signZone: MapZone = {
        id: `district-${type}`,
        type,
        label: config.pluralLabel,
        icon: config.icon,
        cx: MAIN_ROAD_X + side * (ROAD_WIDTH / 2 + 40),
        cy: currentY,
        width: 120,
        height: 40,
        color,
        kind: 'district-sign',
        districtType: type,
        bricks: []
      }
      zones.push(signZone)

      // Build individual building zones
      const districtZones: MapZone[] = []

      if (isSkill) {
        // Grid layout for skills
        const cols = Math.min(SKILL_COLS, typeBricks.length)
        const totalGridW = cols * bSize.width + (cols - 1) * BUILDING_GAP
        const startX = districtCenterX - totalGridW / 2 + bSize.width / 2

        for (let i = 0; i < typeBricks.length; i++) {
          const brick = typeBricks[i]!
          const col = i % cols
          const row = Math.floor(i / cols)
          const bx = startX + col * (bSize.width + BUILDING_GAP)
          const by = currentY + row * (bSize.height + BUILDING_GAP)

          const zone: MapZone = {
            id: `brick-${brick.id}`,
            type,
            label: brick.title,
            icon: config.icon,
            cx: bx,
            cy: by,
            width: bSize.width,
            height: bSize.height,
            color,
            kind: 'building',
            brick,
            districtType: type,
            bricks: [brick]
          }
          zones.push(zone)
          districtZones.push(zone)
        }

        // Compute district height for positioning next district
        const rows = Math.ceil(typeBricks.length / cols)
        const districtHeight = rows * bSize.height + (rows - 1) * BUILDING_GAP
        currentY += districtHeight + DISTRICT_GAP_Y
      } else {
        // Horizontal row layout for standard bricks
        const totalRowW = typeBricks.length * bSize.width + (typeBricks.length - 1) * BUILDING_GAP
        const startX = districtCenterX - totalRowW / 2 + bSize.width / 2

        for (let i = 0; i < typeBricks.length; i++) {
          const brick = typeBricks[i]!
          const bx = startX + i * (bSize.width + BUILDING_GAP)
          const subtitle = brick.frontmatter?.subtitle || brick.frontmatter?.company || ''

          const zone: MapZone = {
            id: `brick-${brick.id}`,
            type,
            label: brick.title,
            subtitle: typeof subtitle === 'string' ? subtitle : '',
            icon: config.icon,
            cx: bx,
            cy: currentY,
            width: bSize.width,
            height: bSize.height,
            color,
            kind: 'building',
            brick,
            districtType: type,
            bricks: [brick]
          }
          zones.push(zone)
          districtZones.push(zone)
        }

        currentY += bSize.height + DISTRICT_GAP_Y
      }

      districts.push({
        type,
        label: config.pluralLabel,
        color,
        zones: districtZones
      })

      sideIndex++
    }

    // --- Contact zone at bottom center ---
    const s = settings.value
    const hasContact = s?.email || s?.phone || s?.linkedIn || s?.github
    if (hasContact) {
      const contactSize = BUILDING_SIZES.contact
      const contactZone: MapZone = {
        id: 'contact',
        type: 'contact',
        label: 'Contact',
        icon: 'i-lucide-mail',
        cx: MAIN_ROAD_X,
        cy: currentY,
        width: contactSize.width,
        height: contactSize.height,
        color: ZONE_COLORS.contact!,
        kind: 'settings-zone',
        bricks: []
      }
      zones.push(contactZone)
      currentY += contactSize.height / 2
    }

    // --- Build roads ---
    // Main vertical road from hero to bottom
    const mainRoadTop = heroY - heroSize.height / 2 - 40
    const mainRoadBottom = currentY + 80
    roads.push({
      x1: MAIN_ROAD_X,
      y1: mainRoadTop,
      x2: MAIN_ROAD_X,
      y2: mainRoadBottom,
      width: ROAD_WIDTH
    })

    // Horizontal lanes to each district
    for (const district of districts) {
      if (district.zones.length === 0) continue

      // Find the vertical center of the district
      const dZones = district.zones
      const minY = Math.min(...dZones.map(z => z.cy - z.height / 2))
      const maxY = Math.max(...dZones.map(z => z.cy + z.height / 2))
      const midY = (minY + maxY) / 2

      // Horizontal connector from main road to district
      const minX = Math.min(...dZones.map(z => z.cx - z.width / 2))
      const maxX = Math.max(...dZones.map(z => z.cx + z.width / 2))

      // Determine which side the district is on
      const avgX = dZones.reduce((sum, z) => sum + z.cx, 0) / dZones.length
      if (avgX < MAIN_ROAD_X) {
        // Left side district
        roads.push({
          x1: minX - 30,
          y1: midY,
          x2: MAIN_ROAD_X - ROAD_WIDTH / 2,
          y2: midY,
          width: ROAD_WIDTH
        })
      } else {
        // Right side district
        roads.push({
          x1: MAIN_ROAD_X + ROAD_WIDTH / 2,
          y1: midY,
          x2: maxX + 30,
          y2: midY,
          width: ROAD_WIDTH
        })
      }

      // Intra-district lane (vertical lane along buildings if multi-row)
      if (dZones.length > 1) {
        const laneX = avgX < MAIN_ROAD_X
          ? maxX + 20
          : minX - 20
        if (maxY - minY > 20) {
          roads.push({
            x1: laneX,
            y1: minY - 20,
            x2: laneX,
            y2: maxY + 20,
            width: ROAD_WIDTH * 0.6
          })
        }
      }
    }

    // --- World bounds ---
    const allX = zones.map(z => [z.cx - z.width / 2, z.cx + z.width / 2]).flat()
    const allY = zones.map(z => [z.cy - z.height / 2, z.cy + z.height / 2]).flat()
    const worldWidth = Math.max(MAIN_ROAD_X * 2, (Math.max(...allX) - Math.min(...allX))) + MARGIN * 2
    const worldHeight = (Math.max(...allY) - Math.min(...allY)) + MARGIN * 2

    // Offset all zones so they're centered in the world
    const offsetX = (worldWidth - (Math.max(...allX) + Math.min(...allX))) / 2
    const offsetY = MARGIN - Math.min(...allY) + 40
    for (const zone of zones) {
      zone.cx += offsetX
      zone.cy += offsetY
    }

    // Offset roads too
    for (const road of roads) {
      road.x1 += offsetX
      road.y1 += offsetY
      road.x2 += offsetX
      road.y2 += offsetY
    }

    // Spawn at hero zone
    const spawnZone = zones.find(z => z.id === 'hero')
    const spawnPoint = spawnZone
      ? { x: spawnZone.cx, y: spawnZone.cy + spawnZone.height / 2 + 60 }
      : { x: worldWidth / 2, y: MARGIN + 150 }

    return { worldWidth, worldHeight, zones, roads, spawnPoint, districts }
  })

  return { townMap }
}
