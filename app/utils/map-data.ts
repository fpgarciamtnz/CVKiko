import type { BrickType } from '~/utils/brick-types'

export interface MapZone {
  id: string
  type: 'hero' | 'contact' | BrickType
  label: string
  icon: string
  cx: number
  cy: number
  width: number
  height: number
  color: number
  bricks: import('~/composables/useBricks').Brick[]
}

export interface RoadSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
}

export interface TownMap {
  worldWidth: number
  worldHeight: number
  zones: MapZone[]
  roads: RoadSegment[]
  spawnPoint: { x: number, y: number }
}

// Colors for zone building types
export const ZONE_COLORS: Record<string, number> = {
  hero: 0x3498db,
  experience: 0x2980b9,
  education: 0x8e44ad,
  project: 0x27ae60,
  skill: 0xf39c12,
  publication: 0xe74c3c,
  custom: 0x95a5a6,
  contact: 0x1abc9c
}
