import type { Keys2D } from './useKeyboard2D'

export interface CarState {
  x: number
  y: number
  angle: number
  speed: number
}

interface CarPhysicsOptions {
  accel?: number
  brakeDecel?: number
  friction?: number
  turnRate?: number
  maxSpeed?: number
  reverseMaxSpeed?: number
}

export function useCarPhysics2D(options: CarPhysicsOptions = {}) {
  const {
    accel = 0.15,
    brakeDecel = 0.2,
    friction = 0.97,
    turnRate = 0.04,
    maxSpeed = 5,
    reverseMaxSpeed = 2
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
    // Accelerate / brake
    if (keys.up) {
      car.speed = Math.min(car.speed + accel, maxSpeed)
    } else if (keys.down) {
      car.speed -= brakeDecel
      if (car.speed < -reverseMaxSpeed) car.speed = -reverseMaxSpeed
    } else {
      // Friction
      car.speed *= friction
      if (Math.abs(car.speed) < 0.01) car.speed = 0
    }

    // Steering (only when moving)
    if (Math.abs(car.speed) > 0.1) {
      const steerDirection = car.speed > 0 ? 1 : -1
      if (keys.left) {
        car.angle -= turnRate * steerDirection
      }
      if (keys.right) {
        car.angle += turnRate * steerDirection
      }
    }

    // Update position
    car.x += Math.cos(car.angle) * car.speed
    car.y += Math.sin(car.angle) * car.speed

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
