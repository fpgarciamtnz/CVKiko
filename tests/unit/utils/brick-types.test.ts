import { describe, it, expect } from 'vitest'
import {
  BRICK_TYPES,
  BRICK_TYPE_CONFIG,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  LOCATION_TYPES,
  PUBLICATION_TYPES,
  DEGREE_OPTIONS,
  formatDateRange,
  structuredDataToMarkdown
} from '../../../app/utils/brick-types'
import type {
  ExperienceData,
  EducationData,
  ProjectData,
  SkillData,
  PublicationData,
  CustomData
} from '../../../app/utils/brick-types'

// ============================================
// formatDateRange
// ============================================
describe('formatDateRange', () => {
  it('returns empty string for undefined startDate', () => {
    expect(formatDateRange(undefined, '2024-06-20')).toBe('')
  })

  it('returns empty string for null startDate', () => {
    expect(formatDateRange(null, '2024-06-20')).toBe('')
  })

  it('returns empty string for empty string startDate', () => {
    expect(formatDateRange('', '2024-06-20')).toBe('')
  })

  it('formats full date range correctly', () => {
    const result = formatDateRange('2023-01-15', '2024-06-20')
    expect(result).toBe('Jan 2023 - Jun 2024')
  })

  it('uses Present when no endDate', () => {
    const result = formatDateRange('2023-01-15')
    expect(result).toMatch(/^Jan 2023 - Present$/)
  })

  it('uses Present when endDate is empty string', () => {
    const result = formatDateRange('2023-01-15', '')
    expect(result).toBe('Jan 2023 - Present')
  })

  it('uses Present when endDate is null', () => {
    const result = formatDateRange('2023-01-15', null)
    expect(result).toBe('Jan 2023 - Present')
  })
})

// ============================================
// structuredDataToMarkdown — Experience
// ============================================
describe('structuredDataToMarkdown — experience', () => {
  const empty: ExperienceData = {
    jobTitle: '',
    company: '',
    location: '',
    locationType: '',
    isInternship: false,
    startDate: '',
    endDate: '',
    responsibilities: [],
    achievements: [],
    technologies: []
  }

  it('returns empty string when all fields are empty', () => {
    expect(structuredDataToMarkdown('experience', empty)).toBe('')
  })

  it('includes Internship label when isInternship is true', () => {
    const data: ExperienceData = { ...empty, isInternship: true }
    expect(structuredDataToMarkdown('experience', data)).toContain('**Internship**')
  })

  it('includes Responsibilities heading and bullets', () => {
    const data: ExperienceData = { ...empty, responsibilities: ['Led team', 'Wrote code'] }
    const md = structuredDataToMarkdown('experience', data)
    expect(md).toContain('## Responsibilities')
    expect(md).toContain('- Led team')
    expect(md).toContain('- Wrote code')
  })

  it('filters out empty/whitespace responsibilities', () => {
    const data: ExperienceData = { ...empty, responsibilities: ['Valid', '', '  ', 'Also valid'] }
    const md = structuredDataToMarkdown('experience', data)
    expect(md).toContain('- Valid')
    expect(md).toContain('- Also valid')
    expect(md).not.toContain('-  ')
    expect(md).not.toContain('- \n')
  })

  it('includes Achievements heading and bullets', () => {
    const data: ExperienceData = { ...empty, achievements: ['Increased revenue 20%'] }
    const md = structuredDataToMarkdown('experience', data)
    expect(md).toContain('## Achievements')
    expect(md).toContain('- Increased revenue 20%')
  })

  it('includes Technologies line', () => {
    const data: ExperienceData = { ...empty, technologies: ['Vue', 'TS'] }
    const md = structuredDataToMarkdown('experience', data)
    expect(md).toContain('**Technologies:** Vue, TS')
  })

  it('omits sections when arrays are empty', () => {
    const data: ExperienceData = { ...empty, technologies: ['React'] }
    const md = structuredDataToMarkdown('experience', data)
    expect(md).not.toContain('## Responsibilities')
    expect(md).not.toContain('## Achievements')
    expect(md).toContain('**Technologies:** React')
  })
})

// ============================================
// structuredDataToMarkdown — Education
// ============================================
describe('structuredDataToMarkdown — education', () => {
  const empty: EducationData = {
    degree: '',
    field: '',
    institution: '',
    location: '',
    graduationDate: '',
    isExpected: false,
    gpa: '',
    honors: [],
    coursework: [],
    activities: [],
    thesis: ''
  }

  it('returns empty string when all fields are empty', () => {
    expect(structuredDataToMarkdown('education', empty)).toBe('')
  })

  it('includes Relevant Coursework heading and bullets', () => {
    const data: EducationData = { ...empty, coursework: ['Algorithms', 'ML'] }
    const md = structuredDataToMarkdown('education', data)
    expect(md).toContain('## Relevant Coursework')
    expect(md).toContain('- Algorithms')
    expect(md).toContain('- ML')
  })

  it('includes Honors line', () => {
    const data: EducationData = { ...empty, honors: ['Cum Laude', "Dean's List"] }
    const md = structuredDataToMarkdown('education', data)
    expect(md).toContain("**Honors:** Cum Laude, Dean's List")
  })

  it('includes Activities heading and bullets', () => {
    const data: EducationData = { ...empty, activities: ['Chess Club', 'Student Gov'] }
    const md = structuredDataToMarkdown('education', data)
    expect(md).toContain('## Activities')
    expect(md).toContain('- Chess Club')
  })

  it('includes Thesis line', () => {
    const data: EducationData = { ...empty, thesis: 'ML in Healthcare' }
    const md = structuredDataToMarkdown('education', data)
    expect(md).toContain('**Thesis:** ML in Healthcare')
  })
})

// ============================================
// structuredDataToMarkdown — Project
// ============================================
describe('structuredDataToMarkdown — project', () => {
  const empty: ProjectData = {
    name: '',
    role: '',
    description: '',
    problem: '',
    features: [],
    technologies: [],
    outcome: '',
    links: [],
    isPersonal: true,
    date: ''
  }

  it('starts with description text', () => {
    const data: ProjectData = { ...empty, description: 'A cool tool' }
    const md = structuredDataToMarkdown('project', data)
    expect(md.startsWith('A cool tool')).toBe(true)
  })

  it('includes Problem line', () => {
    const data: ProjectData = { ...empty, problem: 'Slow builds' }
    const md = structuredDataToMarkdown('project', data)
    expect(md).toContain('**Problem:** Slow builds')
  })

  it('includes Key Features heading with filtered bullets', () => {
    const data: ProjectData = { ...empty, features: ['Fast', '', 'Reliable'] }
    const md = structuredDataToMarkdown('project', data)
    expect(md).toContain('## Key Features')
    expect(md).toContain('- Fast')
    expect(md).toContain('- Reliable')
  })

  it('includes Tech Stack line', () => {
    const data: ProjectData = { ...empty, technologies: ['React', 'Go'] }
    const md = structuredDataToMarkdown('project', data)
    expect(md).toContain('**Tech Stack:** React, Go')
  })

  it('includes Outcome line', () => {
    const data: ProjectData = { ...empty, outcome: '50% faster' }
    const md = structuredDataToMarkdown('project', data)
    expect(md).toContain('**Outcome:** 50% faster')
  })

  it('returns empty string when all fields are empty', () => {
    expect(structuredDataToMarkdown('project', empty)).toBe('')
  })
})

// ============================================
// structuredDataToMarkdown — Skill
// ============================================
describe('structuredDataToMarkdown — skill', () => {
  const empty: SkillData = {
    name: '',
    category: 'technical',
    proficiency: 'intermediate',
    yearsOfExperience: 0,
    context: '',
    relatedProjects: []
  }

  it('always includes proficiency', () => {
    const md = structuredDataToMarkdown('skill', { ...empty, proficiency: 'expert' })
    expect(md).toContain('**Proficiency:** expert')
  })

  it('shows singular year for yearsOfExperience=1', () => {
    const md = structuredDataToMarkdown('skill', { ...empty, yearsOfExperience: 1 })
    expect(md).toContain('**Experience:** 1 year')
    expect(md).not.toContain('years')
  })

  it('shows plural years for yearsOfExperience=5', () => {
    const md = structuredDataToMarkdown('skill', { ...empty, yearsOfExperience: 5 })
    expect(md).toContain('**Experience:** 5 years')
  })

  it('omits Experience line for yearsOfExperience=0', () => {
    const md = structuredDataToMarkdown('skill', empty)
    expect(md).not.toContain('**Experience:**')
  })

  it('includes context string', () => {
    const md = structuredDataToMarkdown('skill', { ...empty, context: 'Used at Google' })
    expect(md).toContain('Used at Google')
  })
})

// ============================================
// structuredDataToMarkdown — Publication
// ============================================
describe('structuredDataToMarkdown — publication', () => {
  const empty: PublicationData = {
    title: '',
    authors: [],
    publicationType: 'article',
    publicationName: '',
    date: '',
    abstract: '',
    contributions: [],
    doi: '',
    url: '',
    citations: 0
  }

  it('includes Authors line', () => {
    const data: PublicationData = { ...empty, authors: ['Alice', 'Bob'] }
    const md = structuredDataToMarkdown('publication', data)
    expect(md).toContain('**Authors:** Alice, Bob')
  })

  it('includes Abstract heading and text', () => {
    const data: PublicationData = { ...empty, abstract: 'This paper explores...' }
    const md = structuredDataToMarkdown('publication', data)
    expect(md).toContain('## Abstract')
    expect(md).toContain('This paper explores...')
  })

  it('includes Key Contributions heading with filtered bullets', () => {
    const data: PublicationData = { ...empty, contributions: ['Novel algorithm', '', 'Benchmark'] }
    const md = structuredDataToMarkdown('publication', data)
    expect(md).toContain('## Key Contributions')
    expect(md).toContain('- Novel algorithm')
    expect(md).toContain('- Benchmark')
  })
})

// ============================================
// structuredDataToMarkdown — Custom & Unknown
// ============================================
describe('structuredDataToMarkdown — custom', () => {
  it('returns data.content directly', () => {
    const data: CustomData = { content: 'Hello world' }
    expect(structuredDataToMarkdown('custom', data)).toBe('Hello world')
  })
})

describe('structuredDataToMarkdown — unknown type', () => {
  it('returns empty string for unknown type', () => {
    expect(structuredDataToMarkdown('unknown' as any, {})).toBe('')
  })
})

// ============================================
// Constants & Config
// ============================================
describe('BRICK_TYPES', () => {
  it('has exactly 6 types', () => {
    expect(BRICK_TYPES).toHaveLength(6)
  })

  it('contains all expected types', () => {
    expect(BRICK_TYPES).toEqual(
      expect.arrayContaining(['experience', 'education', 'project', 'skill', 'publication', 'custom'])
    )
  })
})

describe('BRICK_TYPE_CONFIG', () => {
  it('each type has required config fields', () => {
    for (const type of BRICK_TYPES) {
      const config = BRICK_TYPE_CONFIG[type]
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('pluralLabel')
      expect(config).toHaveProperty('icon')
      expect(config).toHaveProperty('color')
      expect(config).toHaveProperty('description')
      expect(typeof config.defaultData).toBe('function')
    }
  })

  it('experience defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.experience.defaultData() as any
    expect(data.isInternship).toBe(false)
    expect(data.responsibilities).toEqual([''])
    expect(data.technologies).toEqual([])
  })

  it('education defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.education.defaultData() as any
    expect(data.isExpected).toBe(false)
    expect(data.coursework).toEqual([])
    expect(data.thesis).toBe('')
  })

  it('project defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.project.defaultData() as any
    expect(data.isPersonal).toBe(true)
    expect(data.features).toEqual([''])
    expect(data.links).toEqual([])
  })

  it('skill defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.skill.defaultData() as any
    expect(data.proficiency).toBe('intermediate')
    expect(data.category).toBe('technical')
    expect(data.yearsOfExperience).toBe(0)
  })

  it('publication defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.publication.defaultData() as any
    expect(data.publicationType).toBe('article')
    expect(data.authors).toEqual([''])
    expect(data.citations).toBe(0)
  })

  it('custom defaultData returns correct shape', () => {
    const data = BRICK_TYPE_CONFIG.custom.defaultData() as any
    expect(data.content).toBe('')
  })
})

describe('SKILL_CATEGORIES', () => {
  it('has 5 entries', () => {
    expect(SKILL_CATEGORIES).toHaveLength(5)
  })

  it('contains technical, language, tool, soft, other', () => {
    const values = SKILL_CATEGORIES.map(c => c.value)
    expect(values).toEqual(['technical', 'language', 'tool', 'soft', 'other'])
  })
})

describe('PROFICIENCY_LEVELS', () => {
  it('has 4 entries in order beginner → expert', () => {
    expect(PROFICIENCY_LEVELS).toHaveLength(4)
    const values = PROFICIENCY_LEVELS.map(p => p.value)
    expect(values).toEqual(['beginner', 'intermediate', 'advanced', 'expert'])
  })
})

describe('LOCATION_TYPES', () => {
  it('has 4 entries with first value being empty string', () => {
    expect(LOCATION_TYPES).toHaveLength(4)
    expect(LOCATION_TYPES[0].value).toBe('')
  })
})

describe('PUBLICATION_TYPES', () => {
  it('has 6 entries', () => {
    expect(PUBLICATION_TYPES).toHaveLength(6)
  })
})

describe('DEGREE_OPTIONS', () => {
  it('includes BS and PhD', () => {
    expect(DEGREE_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.stringContaining('BS'),
        expect.stringContaining('PhD')
      ])
    )
  })

  it('ends with Other', () => {
    expect(DEGREE_OPTIONS[DEGREE_OPTIONS.length - 1]).toBe('Other')
  })
})
