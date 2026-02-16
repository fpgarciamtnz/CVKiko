<script setup lang="ts">
import type { MapZone, District } from '~/utils/map-data'

const props = defineProps<{
  zones: MapZone[]
  districts: District[]
  activeZoneId: string | null
  carX: number
  carY: number
  worldWidth: number
  worldHeight: number
}>()

const emit = defineEmits<{
  teleport: [zoneId: string]
}>()

const isTouchDevice = ref(false)
const minimapCanvas = ref<HTMLCanvasElement | null>(null)

const MINIMAP_W = 160
const MINIMAP_H = 120

// Interactive zones (no district signs)
const teleportZones = computed(() =>
  props.zones.filter(z => z.kind !== 'district-sign')
)

onMounted(() => {
  isTouchDevice.value
    = window.matchMedia('(pointer: coarse)').matches
      || navigator.maxTouchPoints > 0
      || 'ontouchstart' in window
})

// Draw minimap
watch(
  [() => props.carX, () => props.carY, () => props.zones, () => props.activeZoneId],
  () => drawMinimap(),
  { flush: 'post' }
)

onMounted(() => {
  nextTick(() => drawMinimap())
})

function drawMinimap() {
  const canvas = minimapCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const scaleX = MINIMAP_W / (props.worldWidth || 1)
  const scaleY = MINIMAP_H / (props.worldHeight || 1)

  ctx.clearRect(0, 0, MINIMAP_W, MINIMAP_H)

  // Background
  ctx.fillStyle = 'rgba(58, 125, 68, 0.6)'
  ctx.fillRect(0, 0, MINIMAP_W, MINIMAP_H)

  // District region rectangles (faint)
  for (const district of props.districts) {
    if (district.zones.length === 0) continue
    const dZones = district.zones
    const minX = Math.min(...dZones.map(z => (z.cx - z.width / 2) * scaleX))
    const minY = Math.min(...dZones.map(z => (z.cy - z.height / 2) * scaleY))
    const maxX = Math.max(...dZones.map(z => (z.cx + z.width / 2) * scaleX))
    const maxY = Math.max(...dZones.map(z => (z.cy + z.height / 2) * scaleY))

    ctx.fillStyle = `#${district.color.toString(16).padStart(6, '0')}33`
    ctx.strokeStyle = `#${district.color.toString(16).padStart(6, '0')}66`
    ctx.lineWidth = 1
    ctx.fillRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4)
    ctx.strokeRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4)
  }

  // Zone dots (skip district signs)
  for (const zone of props.zones) {
    if (zone.kind === 'district-sign') continue

    const x = zone.cx * scaleX
    const y = zone.cy * scaleY
    const isActive = zone.id === props.activeZoneId

    ctx.fillStyle = isActive ? '#f1c40f' : `#${zone.color.toString(16).padStart(6, '0')}`
    ctx.beginPath()
    ctx.arc(x, y, isActive ? 5 : 3, 0, Math.PI * 2)
    ctx.fill()

    if (isActive) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  // Car dot
  const carMX = props.carX * scaleX
  const carMY = props.carY * scaleY
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.arc(carMX, carMY, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1.5
  ctx.stroke()
}
</script>

<template>
  <div class="absolute top-4 left-4 z-20 flex flex-col gap-3">
    <!-- Minimap -->
    <div class="bg-black/50 backdrop-blur-sm rounded-lg p-2 shadow-lg">
      <canvas
        ref="minimapCanvas"
        :width="MINIMAP_W"
        :height="MINIMAP_H"
        class="rounded"
      />
    </div>

    <!-- Controls hint -->
    <div class="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/70">
      <template v-if="isTouchDevice">
        Use joystick to drive
      </template>
      <template v-else>
        WASD / Arrows to drive
      </template>
    </div>

    <!-- Zone labels (teleport) grouped by district -->
    <div class="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 space-y-2 max-h-80 overflow-y-auto">
      <!-- Hero / Contact (settings zones) -->
      <button
        v-for="zone in teleportZones.filter(z => z.kind === 'settings-zone')"
        :key="zone.id"
        class="block w-full text-left text-xs px-2 py-1 rounded transition-colors"
        :class="[
          activeZoneId === zone.id
            ? 'bg-white/20 text-white font-semibold'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        ]"
        @click="emit('teleport', zone.id)"
      >
        {{ zone.label }}
      </button>

      <!-- Districts -->
      <template
        v-for="district in districts"
        :key="district.type"
      >
        <div
          v-if="district.zones.length > 0"
          class="pt-1"
        >
          <p class="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-0.5">
            {{ district.label }}
          </p>
          <button
            v-for="zone in district.zones"
            :key="zone.id"
            class="block w-full text-left text-xs px-2 py-1 rounded transition-colors"
            :class="[
              activeZoneId === zone.id
                ? 'bg-white/20 text-white font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            ]"
            @click="emit('teleport', zone.id)"
          >
            {{ zone.label }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
