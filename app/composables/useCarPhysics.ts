export interface CarState {
  x: number
  velocity: number
  direction: 1 | -1
}

interface CarPhysicsOptions {
  acceleration?: number
  maxSpeed?: number
  deceleration?: number
  worldMin?: number
  worldMax?: number
}

export function useCarPhysics(options: CarPhysicsOptions = {}) {
  const {
    acceleration = 600,
    maxSpeed = 500,
    deceleration = 400
  } = options

  const worldMin = ref(options.worldMin ?? 0)
  const worldMax = ref(options.worldMax ?? 5000)

  const car = reactive<CarState>({
    x: 200,
    velocity: 0,
    direction: 1
  })

  function update(dt: number, keys: { left: boolean, right: boolean }) {
    let accel = 0

    if (keys.right) {
      accel = acceleration
      car.direction = 1
    } else if (keys.left) {
      accel = -acceleration
      car.direction = -1
    }

    if (accel !== 0) {
      car.velocity += accel * dt
      car.velocity = Math.max(-maxSpeed, Math.min(maxSpeed, car.velocity))
    } else {
      // Apply friction/deceleration
      if (car.velocity > 0) {
        car.velocity = Math.max(0, car.velocity - deceleration * dt)
      } else if (car.velocity < 0) {
        car.velocity = Math.min(0, car.velocity + deceleration * dt)
      }
    }

    car.x += car.velocity * dt

    // Clamp to world bounds
    if (car.x < worldMin.value) {
      car.x = worldMin.value
      car.velocity = 0
    }
    if (car.x > worldMax.value) {
      car.x = worldMax.value
      car.velocity = 0
    }
  }

  function jumpTo(x: number) {
    car.x = Math.max(worldMin.value, Math.min(worldMax.value, x))
    car.velocity = 0
  }

  return { car, worldMin, worldMax, update, jumpTo }
}
