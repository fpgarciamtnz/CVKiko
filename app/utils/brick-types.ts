export type BrickType = 'experience' | 'education' | 'project' | 'skill' | 'publication' | 'custom'

export interface BrickFrontmatter {
  subtitle?: string
  location?: string
  startDate?: string
  endDate?: string
  url?: string
  company?: string
  role?: string
  [key: string]: unknown
}

// Brick type is defined in composables/useBricks.ts
// Re-export for convenience
export type { Brick } from '~/composables/useBricks'

export interface BrickTypeConfig {
  label: string
  pluralLabel: string
  icon: string
  color: string
  description: string
  template: string // Markdown template for new bricks
}

export const BRICK_TYPE_CONFIG: Record<BrickType, BrickTypeConfig> = {
  experience: {
    label: 'Experience',
    pluralLabel: 'Work Experience',
    icon: 'i-lucide-briefcase',
    color: 'blue',
    description: 'Work history, jobs, and professional roles',
    template: `## Responsibilities

- Led development of...
- Collaborated with...
- Implemented...

## Achievements

- Increased performance by X%
- Delivered project ahead of schedule
`
  },
  education: {
    label: 'Education',
    pluralLabel: 'Education',
    icon: 'i-lucide-graduation-cap',
    color: 'purple',
    description: 'Degrees, certifications, and courses',
    template: `## Coursework

- Data Structures & Algorithms
- Machine Learning
- Software Engineering

## Activities

- Member of...
- Participated in...
`
  },
  project: {
    label: 'Project',
    pluralLabel: 'Projects',
    icon: 'i-lucide-code',
    color: 'green',
    description: 'Personal and professional projects',
    template: `## Overview

A brief description of what the project does and why it was built.

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Tech Stack

Built with TypeScript, Vue.js, and Node.js.
`
  },
  skill: {
    label: 'Skill',
    pluralLabel: 'Skills',
    icon: 'i-lucide-wrench',
    color: 'amber',
    description: 'Technical skills, languages, and tools',
    template: `Proficient in this technology with X years of experience.

Used in projects like...
`
  },
  publication: {
    label: 'Publication',
    pluralLabel: 'Publications',
    icon: 'i-lucide-file-text',
    color: 'rose',
    description: 'Papers, articles, books, and patents',
    template: `## Abstract

Brief summary of the publication...

## Key Contributions

- Contribution 1
- Contribution 2
`
  },
  custom: {
    label: 'Custom',
    pluralLabel: 'Custom Sections',
    icon: 'i-lucide-puzzle',
    color: 'gray',
    description: 'Any custom content block',
    template: `Write your custom content here using **Markdown**.

- Bullet points
- Links [like this](https://example.com)
- **Bold** and *italic* text
`
  }
}

export const BRICK_TYPES = Object.keys(BRICK_TYPE_CONFIG) as BrickType[]

export function getBrickTypeConfig(type: BrickType): BrickTypeConfig {
  return BRICK_TYPE_CONFIG[type]
}

export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return ''

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : 'Present'

  return `${start} - ${end}`
}

// Parse frontmatter from markdown content
export function parseFrontmatter(content: string): { frontmatter: BrickFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const [, yaml, body] = match
  const frontmatter: BrickFrontmatter = {}

  yaml.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim()
      frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '')
    }
  })

  return { frontmatter, body: body.trim() }
}

// Generate frontmatter from object
export function generateFrontmatter(fm: BrickFrontmatter): string {
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)

  if (lines.length === 0) return ''
  return `---\n${lines.join('\n')}\n---\n\n`
}
