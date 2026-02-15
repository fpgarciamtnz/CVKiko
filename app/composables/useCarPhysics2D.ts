import type { Keys2D } from './useKeyboard2D'

export interface CarState {
  x: number
  y: number
  angle: number
  speed: number
}

interface CarPhysicsOptions {
  accel?: number
  friction?: number
  maxSpeed?: number
  turnSpeed?: number
}

export function useCarPhysics2D(options: CarPhysicsOptions = {}) {
  const {
    accel = 0.15,
    friction = 0.97,
    maxSpeed = 5,
    turnSpeed = 0.15
  } = options

  const car = reactive<CarState>({
    x: 0,
    y: 0,
    angle: 0,
    speed: 0
  })

  const worldBounds = reactive({
    minX: 0,
    minY: 0,
    maxX: 4000,
    maxY: 3000
  })

  function update(keys: Keys2D) {
    // Build direction vector from keys
    const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
    const dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    const hasInput = dx !== 0 || dy !== 0

    // Normalize diagonal so speed is consistent
    const len = Math.sqrt(dx * dx + dy * dy)
    const ndx = hasInput ? dx / len : 0
    const ndy = hasInput ? dy / len : 0

    // Accelerate / decelerate
    if (hasInput) {
      car.speed = Math.min(car.speed + accel, maxSpeed)
    } else {
      car.speed *= friction
      if (car.speed < 0.01) car.speed = 0
    }

    // Move position using the direction vector
    car.x += ndx * car.speed
    car.y += ndy * car.speed

    // Smooth rotation toward movement direction (only when moving)
    if (hasInput) {
      const target = Math.atan2(ndy, ndx)
      let delta = target - car.angle
      // Shortest-arc: normalize delta to [-PI, PI]
      delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI
      if (delta < -Math.PI) delta += Math.PI * 2
      car.angle += delta * turnSpeed
    }

    // Clamp to world bounds (with car half-size margin)
    const margin = 20
    car.x = Math.max(worldBounds.minX + margin, Math.min(car.x, worldBounds.maxX - margin))
    car.y = Math.max(worldBounds.minY + margin, Math.min(car.y, worldBounds.maxY - margin))
  }

  function jumpTo(x: number, y: number, angle?: number) {
    car.x = x
    car.y = y
    if (angle !== undefined) car.angle = angle
    car.speed = 0
  }

  return { car, worldBounds, update, jumpTo }
}
