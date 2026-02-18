import { describe, it, expect } from 'vitest'
import {
  ROADMAP_PHASES,
  DIFFICULTY_CONFIG,
  getTotalTasks,
  getPhaseTaskIds
} from '../../../app/utils/roadmap-data'

describe('ROADMAP_PHASES', () => {
  it('has 6 phases', () => {
    expect(ROADMAP_PHASES).toHaveLength(6)
  })

  it('each phase has id, title, description, and non-empty tasks', () => {
    for (const phase of ROADMAP_PHASES) {
      expect(typeof phase.id).toBe('string')
      expect(typeof phase.title).toBe('string')
      expect(typeof phase.description).toBe('string')
      expect(phase.tasks.length).toBeGreaterThan(0)
    }
  })

  it('all task IDs are unique across phases', () => {
    const ids = ROADMAP_PHASES.flatMap(p => p.tasks.map(t => t.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each task has correct field types', () => {
    for (const phase of ROADMAP_PHASES) {
      for (const task of phase.tasks) {
        expect(typeof task.id).toBe('string')
        expect(typeof task.skill).toBe('string')
        expect(typeof task.description).toBe('string')
        expect(['easy', 'medium', 'hard']).toContain(task.difficulty)
        expect(typeof task.aiAssisted).toBe('boolean')
      }
    }
  })
})

describe('DIFFICULTY_CONFIG', () => {
  it('has 3 entries with correct label and color', () => {
    expect(Object.keys(DIFFICULTY_CONFIG)).toHaveLength(3)
    expect(DIFFICULTY_CONFIG.easy).toEqual({ label: 'Easy', color: 'success' })
    expect(DIFFICULTY_CONFIG.medium).toEqual({ label: 'Medium', color: 'warning' })
    expect(DIFFICULTY_CONFIG.hard).toEqual({ label: 'Hard', color: 'error' })
  })
})

describe('getTotalTasks', () => {
  it('returns 17', () => {
    expect(getTotalTasks()).toBe(17)
  })
})

describe('getPhaseTaskIds', () => {
  it('returns correct IDs for phase 1', () => {
    expect(getPhaseTaskIds(ROADMAP_PHASES[0])).toEqual(['1a', '1b', '1c'])
  })

  it('returns correct count for each phase', () => {
    expect(getPhaseTaskIds(ROADMAP_PHASES[1])).toHaveLength(3)
    expect(getPhaseTaskIds(ROADMAP_PHASES[2])).toHaveLength(2)
  })
})
