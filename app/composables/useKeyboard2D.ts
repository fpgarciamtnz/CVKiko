export interface Keys2D {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export function useKeyboard2D() {
  const keys = reactive<Keys2D>({
    up: false,
    down: false,
    left: false,
    right: false
  })

  function onKeyDown(e: KeyboardEvent) {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        keys.up = true
        e.preventDefault()
        break
      case 'ArrowDown':
      case 'KeyS':
        keys.down = true
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'KeyA':
        keys.left = true
        e.preventDefault()
        break
      case 'ArrowRight':
      case 'KeyD':
        keys.right = true
        e.preventDefault()
        break
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        keys.up = false
        break
      case 'ArrowDown':
      case 'KeyS':
        keys.down = false
        break
      case 'ArrowLeft':
      case 'KeyA':
        keys.left = false
        break
      case 'ArrowRight':
      case 'KeyD':
        keys.right = false
        break
    }
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
