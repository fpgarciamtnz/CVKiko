import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, toRaw } from 'vue'

// Create a wrapper component that uses useKeyboard2D
const KeyboardWrapper = defineComponent({
  setup() {
    const { keys } = useKeyboard2D()
    return { keys }
  },
  render() {
    return h('div', 'keyboard-test')
  }
})

function dispatchKey(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }))
}

describe('useKeyboard2D', () => {
  let keys: any

  beforeEach(async () => {
    const wrapper = await mountSuspended(KeyboardWrapper)
    keys = (wrapper.vm as any).keys
  })

  describe('keydown sets keys to true', () => {
    it('ArrowUp sets up=true', () => {
      dispatchKey('keydown', 'ArrowUp')
      expect(keys.up).toBe(true)
    })

    it('KeyW sets up=true', () => {
      dispatchKey('keydown', 'KeyW')
      expect(keys.up).toBe(true)
    })

    it('ArrowDown sets down=true', () => {
      dispatchKey('keydown', 'ArrowDown')
      expect(keys.down).toBe(true)
    })

    it('KeyS sets down=true', () => {
      dispatchKey('keydown', 'KeyS')
      expect(keys.down).toBe(true)
    })

    it('ArrowLeft sets left=true', () => {
      dispatchKey('keydown', 'ArrowLeft')
      expect(keys.left).toBe(true)
    })

    it('KeyA sets left=true', () => {
      dispatchKey('keydown', 'KeyA')
      expect(keys.left).toBe(true)
    })

    it('ArrowRight sets right=true', () => {
      dispatchKey('keydown', 'ArrowRight')
      expect(keys.right).toBe(true)
    })

    it('KeyD sets right=true', () => {
      dispatchKey('keydown', 'KeyD')
      expect(keys.right).toBe(true)
    })
  })

  describe('keyup clears corresponding boolean', () => {
    it('keyup ArrowUp clears up', () => {
      dispatchKey('keydown', 'ArrowUp')
      expect(keys.up).toBe(true)
      dispatchKey('keyup', 'ArrowUp')
      expect(keys.up).toBe(false)
    })

    it('keyup ArrowDown clears down', () => {
      dispatchKey('keydown', 'ArrowDown')
      dispatchKey('keyup', 'ArrowDown')
      expect(keys.down).toBe(false)
    })

    it('keyup ArrowLeft clears left', () => {
      dispatchKey('keydown', 'ArrowLeft')
      dispatchKey('keyup', 'ArrowLeft')
      expect(keys.left).toBe(false)
    })

    it('keyup ArrowRight clears right', () => {
      dispatchKey('keydown', 'ArrowRight')
      dispatchKey('keyup', 'ArrowRight')
      expect(keys.right).toBe(false)
    })
  })

  describe('unrecognized key', () => {
    it('Space does not change state', () => {
      const before = { ...toRaw(keys) }
      dispatchKey('keydown', 'Space')
      expect(keys.up).toBe(before.up)
      expect(keys.down).toBe(before.down)
      expect(keys.left).toBe(before.left)
      expect(keys.right).toBe(before.right)
    })
  })

  describe('multiple simultaneous keys', () => {
    it('both up and right can be true', () => {
      dispatchKey('keydown', 'ArrowUp')
      dispatchKey('keydown', 'ArrowRight')
      expect(keys.up).toBe(true)
      expect(keys.right).toBe(true)
    })

    it('releasing one key does not affect the other', () => {
      dispatchKey('keydown', 'ArrowUp')
      dispatchKey('keydown', 'ArrowRight')
      dispatchKey('keyup', 'ArrowUp')
      expect(keys.up).toBe(false)
      expect(keys.right).toBe(true)
    })
  })
})
