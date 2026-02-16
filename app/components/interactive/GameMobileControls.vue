<script setup lang="ts">
const emit = defineEmits<{
  input: [{ up: boolean, down: boolean, left: boolean, right: boolean }]
}>()

const isTouchDevice = ref(false)

const BASE_RADIUS = 60
const THUMB_RADIUS = 20

const thumbX = ref(0)
const thumbY = ref(0)
const dragging = ref(false)

function handleTouchStart(e: TouchEvent) {
  e.preventDefault()
  dragging.value = true
  updateThumb(e.touches[0]!)
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  if (!dragging.value) return
  updateThumb(e.touches[0]!)
}

function handleTouchEnd(e: TouchEvent) {
  e.preventDefault()
  dragging.value = false
  thumbX.value = 0
  thumbY.value = 0
  emit('input', { up: false, down: false, left: false, right: false })
}

function updateThumb(touch: Touch) {
  const el = document.getElementById('joystick-base')
  if (!el) return

  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  let dx = touch.clientX - centerX
  let dy = touch.clientY - centerY
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Clamp to base radius
  if (dist > BASE_RADIUS) {
    dx = (dx / dist) * BASE_RADIUS
    dy = (dy / dist) * BASE_RADIUS
  }

  thumbX.value = dx
  thumbY.value = dy

  // Dead zone threshold (20% of radius)
  if (dist < BASE_RADIUS * 0.2) {
    emit('input', { up: false, down: false, left: false, right: false })
    return
  }

  // Angle in degrees: 0 = right, 90 = up, 180 = left, 270 = down
  const angle = ((Math.atan2(-dy, dx) * 180) / Math.PI + 360) % 360

  emit('input', {
    up: angle > 45 && angle < 135,
    left: angle > 135 && angle < 225,
    down: angle > 225 && angle < 315,
    right: angle < 45 || angle > 315
  })
}

onMounted(() => {
  isTouchDevice.value = window.matchMedia('(pointer: coarse)').matches
})
</script>

<template>
  <div
    v-if="isTouchDevice"
    class="fixed bottom-8 left-8 z-20"
    style="touch-action: none"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Base ring -->
    <div
      id="joystick-base"
      class="rounded-full border-2 border-white/40 bg-white/10"
      :style="{ width: `${BASE_RADIUS * 2}px`, height: `${BASE_RADIUS * 2}px` }"
    >
      <!-- Thumb -->
      <div
        class="absolute rounded-full bg-white/60 pointer-events-none"
        :style="{
          width: `${THUMB_RADIUS * 2}px`,
          height: `${THUMB_RADIUS * 2}px`,
          left: `${BASE_RADIUS - THUMB_RADIUS + thumbX}px`,
          top: `${BASE_RADIUS - THUMB_RADIUS + thumbY}px`,
          transition: dragging ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out'
        }"
      />
    </div>
  </div>
</template>
