import { describe, it, expect } from 'vitest'
import { useCarPhysics2D } from '../../../app/composables/useCarPhysics2D'
import type { Keys2D } from '../../../app/composables/useKeyboard2D'

const noKeys: Keys2D = { up: false, down: false, left: false, right: false }

describe('useCarPhysics2D', () => {
  describe('initial state', () => {
    it('starts at (0,0) with angle=0 and speed=0', () => {
      const { car } = useCarPhysics2D()
      expect(car.x).toBe(0)
      expect(car.y).toBe(0)
      expect(car.angle).toBe(0)
      expect(car.speed).toBe(0)
    })

    it('default bounds are 0,0 → 4000,3000', () => {
      const { worldBounds } = useCarPhysics2D()
      expect(worldBounds.minX).toBe(0)
      expect(worldBounds.minY).toBe(0)
      expect(worldBounds.maxX).toBe(4000)
      expect(worldBounds.maxY).toBe(3000)
    })
  })

  describe('no input', () => {
    it('speed stays 0 with no keys pressed', () => {
      const { car, update } = useCarPhysics2D()
      update(noKeys)
      expect(car.speed).toBe(0)
    })

    it('existing speed decays by friction (×0.97)', () => {
      const { car, update } = useCarPhysics2D()
      // Give it some speed first
      update({ ...noKeys, right: true })
      const speedAfterAccel = car.speed
      expect(speedAfterAccel).toBeGreaterThan(0)

      // Now release — friction applied
      update(noKeys)
      expect(car.speed).toBeCloseTo(speedAfterAccel * 0.97, 5)
    })

    it('speed snaps to 0 below 0.01', () => {
      const { car, update } = useCarPhysics2D()
      // Set a tiny speed manually via one accel then many friction steps
      update({ ...noKeys, right: true })
      // Decelerate many times
      for (let i = 0; i < 500; i++) {
        update(noKeys)
      }
      expect(car.speed).toBe(0)
    })
  })

  describe('movement', () => {
    it('right key increases car.x', () => {
      const { car, update } = useCarPhysics2D()
      car.x = 2000
      update({ ...noKeys, right: true })
      expect(car.x).toBeGreaterThan(2000)
    })

    it('up key decreases car.y (screen coords)', () => {
      const { car, update } = useCarPhysics2D()
      // Start inside bounds to avoid clamping at minY + margin
      car.y = 1500
      update({ ...noKeys, up: true })
      expect(car.y).toBeLessThan(1500)
    })

    it('left key decreases car.x', () => {
      const { car, update } = useCarPhysics2D()
      // Start at center to avoid bounds clamping
      car.x = 2000
      update({ ...noKeys, left: true })
      expect(car.x).toBeLessThan(2000)
    })

    it('down key increases car.y', () => {
      const { car, update } = useCarPhysics2D()
      car.y = 1500
      update({ ...noKeys, down: true })
      expect(car.y).toBeGreaterThan(1500)
    })
  })

  describe('max speed', () => {
    it('does not exceed maxSpeed after many updates', () => {
      const { car, update } = useCarPhysics2D()
      for (let i = 0; i < 200; i++) {
        update({ ...noKeys, right: true })
      }
      expect(car.speed).toBeLessThanOrEqual(5)
    })
  })

  describe('custom options', () => {
    it('respects custom accel and maxSpeed', () => {
      const { car, update } = useCarPhysics2D({ accel: 1, maxSpeed: 10 })
      update({ ...noKeys, right: true })
      expect(car.speed).toBe(1)
    })
  })

  describe('bounds clamping', () => {
    it('clamps x to maxX - margin', () => {
      const { car, update } = useCarPhysics2D()
      car.x = 5000
      update(noKeys)
      expect(car.x).toBeLessThanOrEqual(3980) // 4000 - 20 margin
    })

    it('clamps y to maxY - margin', () => {
      const { car, update } = useCarPhysics2D()
      car.y = 5000
      update(noKeys)
      expect(car.y).toBeLessThanOrEqual(2980) // 3000 - 20 margin
    })

    it('clamps x to minX + margin', () => {
      const { car, update } = useCarPhysics2D()
      car.x = -100
      update(noKeys)
      expect(car.x).toBeGreaterThanOrEqual(20) // 0 + 20 margin
    })

    it('clamps y to minY + margin', () => {
      const { car, update } = useCarPhysics2D()
      car.y = -100
      update(noKeys)
      expect(car.y).toBeGreaterThanOrEqual(20) // 0 + 20 margin
    })
  })

  describe('rotation', () => {
    it('pressing up changes angle toward -π/2', () => {
      const { car, update } = useCarPhysics2D()
      update({ ...noKeys, up: true })
      expect(car.angle).not.toBe(0)
    })

    it('no keys → angle unchanged', () => {
      const { car, update } = useCarPhysics2D()
      const initialAngle = car.angle
      update(noKeys)
      expect(car.angle).toBe(initialAngle)
    })
  })

  describe('jumpTo', () => {
    it('teleports to exact position and resets speed', () => {
      const { car, update, jumpTo } = useCarPhysics2D()
      // Build up speed
      update({ ...noKeys, right: true })
      expect(car.speed).toBeGreaterThan(0)

      jumpTo(500, 600)
      expect(car.x).toBe(500)
      expect(car.y).toBe(600)
      expect(car.speed).toBe(0)
    })

    it('sets angle when provided', () => {
      const { car, jumpTo } = useCarPhysics2D()
      jumpTo(100, 200, Math.PI)
      expect(car.angle).toBe(Math.PI)
    })

    it('preserves angle when not provided', () => {
      const { car, update, jumpTo } = useCarPhysics2D()
      // Change angle by moving
      update({ ...noKeys, up: true })
      const angle = car.angle

      jumpTo(100, 200)
      expect(car.angle).toBe(angle)
    })
  })
})
