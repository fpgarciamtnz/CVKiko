<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { BrickType } from '~/utils/brick-types'
import { BRICK_TYPE_CONFIG } from '~/utils/brick-types'

const props = defineProps<{
  bricks: Brick[]
  settings: Settings | null
}>()

// --- Scene sections ---
interface SceneSection {
  id: string
  label: string
  icon: string
  type: 'hero' | 'contact' | BrickType
  x: number
  bricks: Brick[]
}

const SECTION_SPACING = 1500
const SECTION_ORDER: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom']

const sections = computed<SceneSection[]>(() => {
  const result: SceneSection[] = []
  let pos = 400 // Start hero section

  // Hero section
  result.push({
    id: 'hero',
    label: props.settings?.name || 'Welcome',
    icon: 'i-lucide-user',
    type: 'hero',
    x: pos,
    bricks: []
  })

  // Brick sections
  for (const type of SECTION_ORDER) {
    const typeBricks = props.bricks.filter(b => b.type === type)
    if (typeBricks.length === 0) continue
    pos += SECTION_SPACING
    result.push({
      id: type,
      label: BRICK_TYPE_CONFIG[type].pluralLabel,
      icon: BRICK_TYPE_CONFIG[type].icon,
      type,
      x: pos,
      bricks: typeBricks
    })
  }

  // Contact section
  if (props.settings?.email || props.settings?.phone || props.settings?.linkedIn || props.settings?.github) {
    pos += SECTION_SPACING
    result.push({
      id: 'contact',
      label: 'Contact',
      icon: 'i-lucide-mail',
      type: 'contact',
      x: pos,
      bricks: []
    })
  }

  return result
})

const worldWidth = computed(() => {
  if (sections.value.length === 0) return 3000
  return sections.value[sections.value.length - 1]!.x + 600
})

// --- Composables ---
const { keys } = useKeyboard()
const { car, worldMin, worldMax, update: updateCar, jumpTo } = useCarPhysics()

watchEffect(() => {
  worldMin.value = 0
  worldMax.value = worldWidth.value - 200
})

// --- Game loop ---
useGameLoop((dt) => {
  updateCar(dt, keys)
})

// --- Camera ---
const viewportWidth = ref(1200)
const cameraOffset = computed(() => viewportWidth.value * 0.3)

onMounted(() => {
  viewportWidth.value = window.innerWidth
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

function onResize() {
  viewportWidth.value = window.innerWidth
}

const cameraX = computed(() => {
  const target = car.x - cameraOffset.value
  return Math.max(0, Math.min(target, worldWidth.value - viewportWidth.value))
})

// --- Active section detection ---
const ACTIVATION_DISTANCE = 400

const activeSection = computed<SceneSection | null>(() => {
  for (const section of sections.value) {
    if (Math.abs(car.x - section.x) < ACTIVATION_DISTANCE) {
      return section
    }
  }
  return null
})

const activeSectionId = computed(() => activeSection.value?.id ?? null)

function handleJumpToSection(sectionId: string) {
  const section = sections.value.find(s => s.id === sectionId)
  if (section) {
    jumpTo(section.x)
  }
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-900 select-none">
    <!-- Parallax background -->
    <InteractiveParallax
      :camera-x="cameraX"
      :world-width="worldWidth"
    />

    <!-- World container (camera transform) -->
    <div
      class="absolute inset-0"
      :style="{ transform: `translateX(${-cameraX}px)` }"
    >
      <!-- Road -->
      <InteractiveRoad :world-width="worldWidth" />

      <!-- Signs -->
      <InteractiveSign
        v-for="section in sections"
        :key="section.id"
        :x="section.x"
        :label="section.label"
        :icon="section.icon"
        :active="activeSectionId === section.id"
      />

      <!-- Car -->
      <InteractiveCar
        :x="car.x"
        :direction="car.direction"
        :velocity="car.velocity"
      />
    </div>

    <!-- HUD (fixed to viewport) -->
    <InteractiveHud
      :sections="sections"
      :active-section-id="activeSectionId"
      :car-x="car.x"
      @jump="handleJumpToSection"
    />

    <!-- Content panel -->
    <InteractiveContentPanel
      :section="activeSection"
      :settings="settings"
    />
  </div>
</template>
