import type { Container } from 'pixi.js'

/**
 * Creates a procedural top-down car sprite using PixiJS Graphics.
 * Returns a Container with the car drawn at origin, facing right (angle=0).
 */
export function createCarGraphics(PIXI: typeof import('pixi.js')): Container {
  const container = new PIXI.Container()

  // Car body
  const body = new PIXI.Graphics()
  body.roundRect(-20, -12, 40, 24, 5)
  body.fill({ color: 0xe74c3c })
  body.stroke({ color: 0xc0392b, width: 1 })
  container.addChild(body)

  // Windshield (front)
  const windshield = new PIXI.Graphics()
  windshield.roundRect(8, -8, 8, 16, 2)
  windshield.fill({ color: 0x85c1e9, alpha: 0.8 })
  container.addChild(windshield)

  // Rear window
  const rearWindow = new PIXI.Graphics()
  rearWindow.roundRect(-16, -7, 7, 14, 2)
  rearWindow.fill({ color: 0x85c1e9, alpha: 0.6 })
  container.addChild(rearWindow)

  // Wheels
  const wheelPositions = [
    { x: -12, y: -14 },
    { x: -12, y: 14 },
    { x: 12, y: -14 },
    { x: 12, y: 14 }
  ]
  for (const pos of wheelPositions) {
    const wheel = new PIXI.Graphics()
    wheel.roundRect(pos.x - 4, pos.y - 3, 8, 6, 1)
    wheel.fill({ color: 0x2c3e50 })
    container.addChild(wheel)
  }

  // Headlights
  const headlightPositions = [{ x: 18, y: -8 }, { x: 18, y: 8 }]
  for (const pos of headlightPositions) {
    const light = new PIXI.Graphics()
    light.circle(pos.x, pos.y, 2.5)
    light.fill({ color: 0xf1c40f })
    container.addChild(light)
  }

  // Tail lights
  const taillightPositions = [{ x: -19, y: -8 }, { x: -19, y: 8 }]
  for (const pos of taillightPositions) {
    const light = new PIXI.Graphics()
    light.circle(pos.x, pos.y, 2)
    light.fill({ color: 0xe74c3c })
    container.addChild(light)
  }

  return container
}

/**
 * Creates a tree decoration.
 */
export function createTree(PIXI: typeof import('pixi.js')): Container {
  const container = new PIXI.Container()

  // Trunk
  const trunk = new PIXI.Graphics()
  trunk.rect(-3, -4, 6, 10)
  trunk.fill({ color: 0x8B4513 })
  container.addChild(trunk)

  // Canopy
  const canopy = new PIXI.Graphics()
  canopy.circle(0, -10, 12)
  canopy.fill({ color: 0x228B22 })
  container.addChild(canopy)

  return container
}

/**
 * Creates a street light decoration.
 */
export function createStreetLight(PIXI: typeof import('pixi.js')): Container {
  const container = new PIXI.Container()

  // Pole
  const pole = new PIXI.Graphics()
  pole.rect(-1.5, -18, 3, 18)
  pole.fill({ color: 0x666666 })
  container.addChild(pole)

  // Light
  const light = new PIXI.Graphics()
  light.circle(0, -20, 4)
  light.fill({ color: 0xf39c12, alpha: 0.8 })
  container.addChild(light)

  return container
}
