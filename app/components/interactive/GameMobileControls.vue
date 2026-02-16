<script setup lang="ts">
const emit = defineEmits<{
  input: [{ up: boolean, down: boolean, left: boolean, right: boolean }]
}>()

const joystickContainer = ref<HTMLDivElement | null>(null)
const isTouchDevice = ref(false)

onMounted(async () => {
  isTouchDevice.value = window.matchMedia('(pointer: coarse)').matches

  if (!isTouchDevice.value) return

  await nextTick()

  const el = joystickContainer.value
  if (!el) return

  const nipplejs = await import('nipplejs')

  const manager = nipplejs.create({
    zone: el,
    mode: 'dynamic',
    dynamicPage: true,
    color: 'rgba(255,255,255,0.5)',
    size: 120
  })

  manager.on('move', (_evt, data) => {
    if (!data.direction) {
      emit('input', { up: false, down: false, left: false, right: false })
      return
    }
    const angle = data.angle.degree
    const force = Math.min(data.force, 2)
    const threshold = 0.3

    if (force < threshold) {
      emit('input', { up: false, down: false, left: false, right: false })
      return
    }

    // Map angle to directions
    // 0/360 = right, 90 = up, 180 = left, 270 = down
    emit('input', {
      up: angle > 45 && angle < 135,
      left: angle > 135 && angle < 225,
      down: angle > 225 && angle < 315,
      right: angle < 45 || angle > 315
    })
  })

  manager.on('end', () => {
    emit('input', { up: false, down: false, left: false, right: false })
  })

  onUnmounted(() => {
    manager.destroy()
  })
})
</script>

<template>
  <div
    v-if="isTouchDevice"
    ref="joystickContainer"
    class="absolute bottom-0 left-0 w-1/2 h-full z-20"
    style="touch-action: none"
  />
</template>
