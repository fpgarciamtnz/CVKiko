const joystickMode = ref(false)
const initialized = ref(false)

export function useControlMode() {
  if (import.meta.client && !initialized.value) {
    initialized.value = true
    joystickMode.value
      = window.matchMedia('(pointer: coarse)').matches
        || navigator.maxTouchPoints > 0
        || 'ontouchstart' in window
  }

  function toggleControlMode() {
    joystickMode.value = !joystickMode.value
  }

  return { joystickMode: readonly(joystickMode), toggleControlMode }
}
