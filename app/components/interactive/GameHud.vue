<script setup lang="ts">
import type { MapZone } from '~/utils/map-data'

const props = defineProps<{
  zones: MapZone[]
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

onMounted(() => {
  isTouchDevice.value = window.matchMedia('(pointer: coarse)').matches
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

  // Zone dots
  for (const zone of props.zones) {
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

    <!-- Zone labels (teleport) -->
    <div class="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 space-y-1">
      <button
        v-for="zone in zones"
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
  </div>
</template>
