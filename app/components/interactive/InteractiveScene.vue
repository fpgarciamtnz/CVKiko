<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { MapZone } from '~/utils/map-data'
import { createCarGraphics, createTree, createStreetLight, createDistrictSign, createSmallBuilding } from '~/utils/pixi-sprites'

const props = defineProps<{
  bricks: Brick[]
  settings: Settings | null
}>()

// --- Refs ---
const container = ref<HTMLDivElement | null>(null)
const activeZone = ref<MapZone | null>(null)
const carPosition = reactive({ x: 0, y: 0 })
const showTutorial = ref(true)
const hasInteracted = ref(false)
const { joystickMode } = useControlMode()

// --- Map data ---
const bricksRef = computed(() => props.bricks)
const settingsRef = computed(() => props.settings)
const { townMap } = useGameMap(bricksRef, settingsRef)

// --- Keyboard ---
const { keys } = useKeyboard2D()

// --- Car physics ---
const { car, worldBounds, update: updatePhysics, jumpTo } = useCarPhysics2D()

// --- PixiJS App ---
const { app } = usePixiApp(container)

// Track PIXI module reference
let PIXI: typeof import('pixi.js') | null = null
let worldContainer: import('pixi.js').Container | null = null
let carSprite: import('pixi.js').Container | null = null
let grassBg: import('pixi.js').Graphics | null = null

// Camera lerp state
const cameraPos = reactive({ x: 0, y: 0 })

// Touch input from mobile controls
const touchKeys = reactive({ up: false, down: false, left: false, right: false })

// Merged input
const mergedKeys = computed(() => ({
  up: keys.up || touchKeys.up,
  down: keys.down || touchKeys.down,
  left: keys.left || touchKeys.left,
  right: keys.right || touchKeys.right
}))

// Dismiss tutorial on first input
watch(mergedKeys, (k) => {
  if ((k.up || k.down || k.left || k.right) && !hasInteracted.value) {
    hasInteracted.value = true
    showTutorial.value = false
  }
})

// --- Build scene when app is ready ---
watch(app, async (pixiApp) => {
  if (!pixiApp) return

  PIXI = await import('pixi.js')
  worldContainer = new PIXI.Container()
  pixiApp.stage.addChild(worldContainer)

  buildScene()

  // Set spawn point
  const spawn = townMap.value.spawnPoint
  jumpTo(spawn.x, spawn.y, -Math.PI / 2) // Face up
  cameraPos.x = spawn.x
  cameraPos.y = spawn.y

  // Ticker
  pixiApp.ticker.add(() => {
    updatePhysics(mergedKeys.value)
    updateCamera(pixiApp)
    updateActiveZone()

    // Sync car sprite
    if (carSprite) {
      carSprite.x = car.x
      carSprite.y = car.y
      carSprite.rotation = car.angle
    }

    // Track position for HUD
    carPosition.x = car.x
    carPosition.y = car.y
  })
})

// Rebuild scene if map changes
watch(() => townMap.value, () => {
  if (app.value && PIXI && worldContainer) {
    buildScene()
  }
}, { deep: true })

function buildScene() {
  if (!PIXI || !worldContainer) return
  worldContainer.removeChildren()

  const map = townMap.value

  // Update world bounds for physics
  worldBounds.minX = 0
  worldBounds.minY = 0
  worldBounds.maxX = map.worldWidth
  worldBounds.maxY = map.worldHeight

  // Grass background
  grassBg = new PIXI.Graphics()
  grassBg.rect(0, 0, map.worldWidth, map.worldHeight)
  grassBg.fill({ color: 0x3a7d44 })
  worldContainer.addChild(grassBg)

  // Draw roads
  for (const road of map.roads) {
    drawRoad(road)
  }

  // Draw zones by kind
  for (const zone of map.zones) {
    switch (zone.kind) {
      case 'district-sign':
        drawDistrictSign(zone)
        break
      case 'building':
        if (zone.type === 'skill') {
          drawSkillBooth(zone)
        } else {
          drawBuilding(zone)
        }
        break
      case 'settings-zone':
        drawSettingsBuilding(zone)
        break
    }
  }

  // Add decorations (scale tree count with world size)
  addDecorations(map)

  // Car sprite (on top)
  carSprite = createCarGraphics(PIXI)
  worldContainer.addChild(carSprite)
}

function drawRoad(road: { x1: number, y1: number, x2: number, y2: number, width: number }) {
  if (!PIXI || !worldContainer) return

  const isHorizontal = Math.abs(road.y1 - road.y2) < 10
  const roadGfx = new PIXI.Graphics()

  if (isHorizontal) {
    const minX = Math.min(road.x1, road.x2)
    const maxX = Math.max(road.x1, road.x2)
    const y = (road.y1 + road.y2) / 2

    // Road surface
    roadGfx.rect(minX, y - road.width / 2, maxX - minX, road.width)
    roadGfx.fill({ color: 0x555555 })

    // Center line (dashed yellow)
    const dashLength = 20
    const gapLength = 15
    for (let x = minX; x < maxX; x += dashLength + gapLength) {
      const lineGfx = new PIXI.Graphics()
      lineGfx.rect(x, y - 1.5, Math.min(dashLength, maxX - x), 3)
      lineGfx.fill({ color: 0xf1c40f })
      worldContainer!.addChild(lineGfx)
    }

    // Edge lines
    const edgeGfx = new PIXI.Graphics()
    edgeGfx.rect(minX, y - road.width / 2, maxX - minX, 2)
    edgeGfx.fill({ color: 0xeeeeee })
    edgeGfx.rect(minX, y + road.width / 2 - 2, maxX - minX, 2)
    edgeGfx.fill({ color: 0xeeeeee })
    worldContainer!.addChild(edgeGfx)
  } else {
    // Vertical road
    const minY = Math.min(road.y1, road.y2)
    const maxY = Math.max(road.y1, road.y2)
    const x = (road.x1 + road.x2) / 2

    roadGfx.rect(x - road.width / 2, minY, road.width, maxY - minY)
    roadGfx.fill({ color: 0x555555 })

    // Center dashes
    const dashLength = 20
    const gapLength = 15
    for (let cy = minY; cy < maxY; cy += dashLength + gapLength) {
      const lineGfx = new PIXI.Graphics()
      lineGfx.rect(x - 1.5, cy, 3, Math.min(dashLength, maxY - cy))
      lineGfx.fill({ color: 0xf1c40f })
      worldContainer!.addChild(lineGfx)
    }

    // Edge lines
    const edgeGfx = new PIXI.Graphics()
    edgeGfx.rect(x - road.width / 2, minY, 2, maxY - minY)
    edgeGfx.fill({ color: 0xeeeeee })
    edgeGfx.rect(x + road.width / 2 - 2, minY, 2, maxY - minY)
    edgeGfx.fill({ color: 0xeeeeee })
    worldContainer!.addChild(edgeGfx)
  }

  worldContainer!.addChild(roadGfx)
}

function drawBuilding(zone: MapZone) {
  if (!PIXI || !worldContainer) return

  const zoneContainer = new PIXI.Container()
  zoneContainer.x = zone.cx
  zoneContainer.y = zone.cy

  // Building shadow
  const shadow = new PIXI.Graphics()
  shadow.roundRect(-zone.width / 2 + 4, -zone.height / 2 + 4, zone.width, zone.height, 8)
  shadow.fill({ color: 0x000000, alpha: 0.2 })
  zoneContainer.addChild(shadow)

  // Building body
  const building = new PIXI.Graphics()
  building.roundRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height, 8)
  building.fill({ color: zone.color })
  building.stroke({ color: darkenColor(zone.color, 0.3), width: 2 })
  zoneContainer.addChild(building)

  // Roof accent
  const roof = new PIXI.Graphics()
  roof.roundRect(-zone.width / 2 + 8, -zone.height / 2 + 4, zone.width - 16, 10, 3)
  roof.fill({ color: darkenColor(zone.color, 0.15) })
  zoneContainer.addChild(roof)

  // Windows (grid pattern)
  const winCols = 3
  const winRows = 2
  const winW = 16
  const winH = 12
  const startX = -((winCols - 1) * (winW + 8)) / 2
  const startY = -zone.height / 2 + 28
  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      const win = new PIXI.Graphics()
      win.roundRect(startX + c * (winW + 8), startY + r * (winH + 8), winW, winH, 2)
      win.fill({ color: 0xadd8e6, alpha: 0.7 })
      zoneContainer.addChild(win)
    }
  }

  // Door
  const door = new PIXI.Graphics()
  door.roundRect(-8, zone.height / 2 - 22, 16, 18, 3)
  door.fill({ color: darkenColor(zone.color, 0.4) })
  zoneContainer.addChild(door)

  // Title label (above building)
  const label = new PIXI.Text({
    text: truncateText(zone.label, 22),
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 13,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 3,
        distance: 1,
        alpha: 0.5
      }
    }
  })
  label.anchor.set(0.5)
  label.y = -zone.height / 2 - 16
  zoneContainer.addChild(label)

  // Subtitle label (below title)
  if (zone.subtitle) {
    const subtitle = new PIXI.Text({
      text: truncateText(zone.subtitle, 26),
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: 10,
        fill: 0xdddddd,
        align: 'center',
        dropShadow: {
          color: 0x000000,
          blur: 2,
          distance: 1,
          alpha: 0.4
        }
      }
    })
    subtitle.anchor.set(0.5)
    subtitle.y = -zone.height / 2 - 4
    zoneContainer.addChild(subtitle)
  }

  worldContainer!.addChild(zoneContainer)
}

function drawSkillBooth(zone: MapZone) {
  if (!PIXI || !worldContainer) return

  const zoneContainer = new PIXI.Container()
  zoneContainer.x = zone.cx
  zoneContainer.y = zone.cy

  // Use the small building sprite
  const building = createSmallBuilding(PIXI, zone.color)
  zoneContainer.addChild(building)

  // Label above
  const label = new PIXI.Text({
    text: truncateText(zone.label, 12),
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 10,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 2,
        distance: 1,
        alpha: 0.5
      }
    }
  })
  label.anchor.set(0.5)
  label.y = -zone.height / 2 - 12
  zoneContainer.addChild(label)

  worldContainer!.addChild(zoneContainer)
}

function drawDistrictSign(zone: MapZone) {
  if (!PIXI || !worldContainer) return

  const sign = createDistrictSign(PIXI, zone.label, zone.color)
  sign.x = zone.cx
  sign.y = zone.cy
  worldContainer.addChild(sign)
}

function drawSettingsBuilding(zone: MapZone) {
  if (!PIXI || !worldContainer) return

  const zoneContainer = new PIXI.Container()
  zoneContainer.x = zone.cx
  zoneContainer.y = zone.cy

  // Building shadow
  const shadow = new PIXI.Graphics()
  shadow.roundRect(-zone.width / 2 + 4, -zone.height / 2 + 4, zone.width, zone.height, 8)
  shadow.fill({ color: 0x000000, alpha: 0.2 })
  zoneContainer.addChild(shadow)

  // Building body
  const building = new PIXI.Graphics()
  building.roundRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height, 8)
  building.fill({ color: zone.color })
  building.stroke({ color: darkenColor(zone.color, 0.3), width: 2 })
  zoneContainer.addChild(building)

  // Roof accent
  const roof = new PIXI.Graphics()
  roof.roundRect(-zone.width / 2 + 8, -zone.height / 2 + 4, zone.width - 16, 10, 3)
  roof.fill({ color: darkenColor(zone.color, 0.15) })
  zoneContainer.addChild(roof)

  // Windows (grid pattern)
  const winCols = 3
  const winRows = 2
  const winW = 16
  const winH = 12
  const wxStart = -((winCols - 1) * (winW + 8)) / 2
  const wyStart = -zone.height / 2 + 28
  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      const win = new PIXI.Graphics()
      win.roundRect(wxStart + c * (winW + 8), wyStart + r * (winH + 8), winW, winH, 2)
      win.fill({ color: 0xadd8e6, alpha: 0.7 })
      zoneContainer.addChild(win)
    }
  }

  // Door
  const door = new PIXI.Graphics()
  door.roundRect(-8, zone.height / 2 - 22, 16, 18, 3)
  door.fill({ color: darkenColor(zone.color, 0.4) })
  zoneContainer.addChild(door)

  // Label (text above building)
  const label = new PIXI.Text({
    text: zone.label,
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 3,
        distance: 1,
        alpha: 0.5
      }
    }
  })
  label.anchor.set(0.5)
  label.y = -zone.height / 2 - 16
  zoneContainer.addChild(label)

  worldContainer!.addChild(zoneContainer)
}

function addDecorations(map: typeof townMap.value) {
  if (!PIXI || !worldContainer) return

  // Scale tree count with world size
  const worldArea = map.worldWidth * map.worldHeight
  const treeCount = Math.min(120, Math.floor(worldArea / 40000))

  const rng = seedRandom(42)
  for (let i = 0; i < treeCount; i++) {
    const x = rng() * map.worldWidth
    const y = rng() * map.worldHeight

    // Skip if too close to a zone or road
    let tooClose = false
    for (const zone of map.zones) {
      if (Math.abs(x - zone.cx) < zone.width / 2 + 40 && Math.abs(y - zone.cy) < zone.height / 2 + 40) {
        tooClose = true
        break
      }
    }
    for (const road of map.roads) {
      if (pointNearRoad(x, y, road, 50)) {
        tooClose = true
        break
      }
    }
    if (tooClose) continue

    const tree = createTree(PIXI!)
    tree.x = x
    tree.y = y
    worldContainer!.addChild(tree)
  }

  // Street lights along roads
  for (const road of map.roads) {
    const isHorizontal = Math.abs(road.y1 - road.y2) < 10
    if (isHorizontal) {
      const minX = Math.min(road.x1, road.x2)
      const maxX = Math.max(road.x1, road.x2)
      const y = (road.y1 + road.y2) / 2
      for (let lx = minX + 60; lx < maxX - 30; lx += 120) {
        const light = createStreetLight(PIXI!)
        light.x = lx
        light.y = y - road.width / 2 - 10
        worldContainer!.addChild(light)
      }
    } else {
      const minY = Math.min(road.y1, road.y2)
      const maxY = Math.max(road.y1, road.y2)
      const x = (road.x1 + road.x2) / 2
      for (let ly = minY + 60; ly < maxY - 30; ly += 120) {
        const light = createStreetLight(PIXI!)
        light.x = x - road.width / 2 - 10
        light.y = ly
        worldContainer!.addChild(light)
      }
    }
  }
}

function updateCamera(pixiApp: NonNullable<typeof app.value>) {
  if (!worldContainer) return

  const screenW = pixiApp.screen.width
  const screenH = pixiApp.screen.height
  const map = townMap.value

  // Lerp camera toward car
  const lerpFactor = 0.08
  cameraPos.x += (car.x - cameraPos.x) * lerpFactor
  cameraPos.y += (car.y - cameraPos.y) * lerpFactor

  // Compute pivot (world point at screen center)
  let pivotX = cameraPos.x
  let pivotY = cameraPos.y

  // Clamp so we don't show beyond world edges
  pivotX = Math.max(screenW / 2, Math.min(pivotX, map.worldWidth - screenW / 2))
  pivotY = Math.max(screenH / 2, Math.min(pivotY, map.worldHeight - screenH / 2))

  worldContainer.pivot.set(pivotX, pivotY)
  worldContainer.position.set(screenW / 2, screenH / 2)
}

function updateActiveZone() {
  const TRIGGER_MARGIN = 40
  let found: MapZone | null = null

  for (const zone of townMap.value.zones) {
    // Skip district signs — they're decorative, not interactive
    if (zone.kind === 'district-sign') continue

    const halfW = zone.width / 2 + TRIGGER_MARGIN
    const halfH = zone.height / 2 + TRIGGER_MARGIN
    if (
      car.x > zone.cx - halfW
      && car.x < zone.cx + halfW
      && car.y > zone.cy - halfH
      && car.y < zone.cy + halfH
    ) {
      found = zone
      break
    }
  }

  activeZone.value = found
}

function handleTeleport(zoneId: string) {
  const zone = townMap.value.zones.find(z => z.id === zoneId)
  if (zone) {
    jumpTo(zone.cx, zone.cy + zone.height / 2 + 50, -Math.PI / 2)
    cameraPos.x = zone.cx
    cameraPos.y = zone.cy
  }
}

function handleTouchInput(input: { up: boolean, down: boolean, left: boolean, right: boolean }) {
  touchKeys.up = input.up
  touchKeys.down = input.down
  touchKeys.left = input.left
  touchKeys.right = input.right
}

// --- Utility functions ---
function darkenColor(color: number, amount: number): number {
  const r = Math.max(0, ((color >> 16) & 0xff) * (1 - amount)) | 0
  const g = Math.max(0, ((color >> 8) & 0xff) * (1 - amount)) | 0
  const b = Math.max(0, (color & 0xff) * (1 - amount)) | 0
  return (r << 16) | (g << 8) | b
}

function truncateText(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '\u2026' : text
}

function seedRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function pointNearRoad(px: number, py: number, road: { x1: number, y1: number, x2: number, y2: number, width: number }, margin: number): boolean {
  const isH = Math.abs(road.y1 - road.y2) < 10
  if (isH) {
    const minX = Math.min(road.x1, road.x2)
    const maxX = Math.max(road.x1, road.x2)
    const y = (road.y1 + road.y2) / 2
    return px >= minX - margin && px <= maxX + margin && Math.abs(py - y) < road.width / 2 + margin
  } else {
    const minY = Math.min(road.y1, road.y2)
    const maxY = Math.max(road.y1, road.y2)
    const x = (road.x1 + road.x2) / 2
    return py >= minY - margin && py <= maxY + margin && Math.abs(px - x) < road.width / 2 + margin
  }
}
</script>

<template>
  <div class="relative w-full h-full select-none">
    <!-- PixiJS Canvas -->
    <div
      ref="container"
      class="absolute inset-0"
    />

    <!-- Tutorial overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showTutorial"
        class="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click="showTutorial = false"
      >
        <div class="bg-white/95 dark:bg-slate-800/95 rounded-xl px-8 py-6 text-center max-w-sm shadow-2xl">
          <div class="text-4xl mb-3">
            🚗
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Explore this CV
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
            <template v-if="joystickMode">
              Use the joystick to drive between sections
            </template>
            <template v-else>
              Use <kbd class="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">WASD</kbd> or
              <kbd class="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Arrow keys</kbd>
              to drive between sections
            </template>
          </p>
          <p class="text-xs text-slate-400">
            {{ joystickMode ? 'Tap anywhere to start' : 'Click anywhere to start' }}
          </p>
        </div>
      </div>
    </Transition>

    <!-- CV Content Card -->
    <GameCVCard
      :zone="activeZone"
      :settings="settings"
    />

    <!-- Mobile Touch Controls -->
    <GameMobileControls @input="handleTouchInput" />

    <!-- HUD -->
    <GameHud
      :zones="townMap.zones"
      :districts="townMap.districts"
      :active-zone-id="activeZone?.id ?? null"
      :car-x="carPosition.x"
      :car-y="carPosition.y"
      :world-width="townMap.worldWidth"
      :world-height="townMap.worldHeight"
      @teleport="handleTeleport"
    />
  </div>
</template>
