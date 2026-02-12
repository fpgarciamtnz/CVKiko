export function useKeyboard() {
  const keys = reactive({
    left: false,
    right: false
  })

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      keys.left = true
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      keys.right = true
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') keys.left = false
    if (e.key === 'ArrowRight') keys.right = false
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })

  return { keys }
}
