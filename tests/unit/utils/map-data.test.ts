import { describe, it, expect } from 'vitest'
import { ZONE_COLORS, BUILDING_SIZES } from '../../../app/utils/map-data'

describe('ZONE_COLORS', () => {
  it('has 8 entries (hero, 6 brick types, contact)', () => {
    expect(Object.keys(ZONE_COLORS)).toHaveLength(8)
  })

  it('includes all expected keys', () => {
    const expected = ['hero', 'experience', 'education', 'project', 'skill', 'publication', 'custom', 'contact']
    for (const key of expected) {
      expect(ZONE_COLORS).toHaveProperty(key)
    }
  })

  it('all values are valid numbers', () => {
    for (const [, value] of Object.entries(ZONE_COLORS)) {
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('BUILDING_SIZES', () => {
  it('has skill, standard, hero, contact keys', () => {
    expect(BUILDING_SIZES).toHaveProperty('skill')
    expect(BUILDING_SIZES).toHaveProperty('standard')
    expect(BUILDING_SIZES).toHaveProperty('hero')
    expect(BUILDING_SIZES).toHaveProperty('contact')
  })

  it('all sizes have positive width and height', () => {
    for (const [, size] of Object.entries(BUILDING_SIZES)) {
      expect(size.width).toBeGreaterThan(0)
      expect(size.height).toBeGreaterThan(0)
    }
  })

  it('skill size is smaller than standard size', () => {
    expect(BUILDING_SIZES.skill.width).toBeLessThan(BUILDING_SIZES.standard.width)
    expect(BUILDING_SIZES.skill.height).toBeLessThan(BUILDING_SIZES.standard.height)
  })
})
