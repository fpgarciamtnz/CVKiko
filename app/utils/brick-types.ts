export type BrickType = 'experience' | 'education' | 'project' | 'skill' | 'publication' | 'custom'

// ============================================
// STRUCTURED DATA INTERFACES FOR EACH BRICK TYPE
// ============================================

export interface ExperienceData {
  jobTitle: string
  company: string
  location: string
  locationType: 'onsite' | 'remote' | 'hybrid' | ''
  isInternship: boolean
  startDate: string
  endDate: string // Empty = current
  responsibilities: string[] // Action-verb bullet points
  achievements: string[] // Quantified results
  technologies: string[] // Tools/tech used
}

export interface EducationData {
  degree: string // BS, MS, PhD, etc.
  field: string // Major/concentration
  institution: string
  location: string
  graduationDate: string
  isExpected: boolean // Expected graduation
  gpa: string // Optional, show if 3.5+
  honors: string[] // Cum Laude, Dean's List, etc.
  coursework: string[] // Relevant courses
  activities: string[] // Clubs, leadership roles
  thesis: string // Thesis title if applicable
}

export interface ProjectData {
  name: string
  role: string // Your role: Lead Developer, Contributor, etc.
  description: string // 1-2 sentence overview
  problem: string // What problem does it solve
  features: string[] // Key features
  technologies: string[]
  outcome: string // Results/impact
  links: { label: string, url: string }[] // GitHub, Demo, etc.
  isPersonal: boolean // Personal vs Professional
  date: string // When built
}

export interface SkillData {
  name: string
  category: 'technical' | 'language' | 'tool' | 'soft' | 'other'
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience: number
  context: string // Brief context of where/how used
  relatedProjects: string[] // Project names where skill was used
}

export interface PublicationData {
  title: string
  authors: string[] // List with your name highlighted position
  publicationType: 'journal' | 'conference' | 'article' | 'book' | 'patent' | 'other'
  publicationName: string // Journal/Conference name
  date: string
  abstract: string
  contributions: string[] // Your specific contributions
  doi: string
  url: string
  citations: number // Optional
}

export interface CustomData {
  content: string // Markdown content for flexible blocks
}

// Union type for all brick data
export type BrickData
  = | { type: 'experience', data: ExperienceData }
    | { type: 'education', data: EducationData }
    | { type: 'project', data: ProjectData }
    | { type: 'skill', data: SkillData }
    | { type: 'publication', data: PublicationData }
    | { type: 'custom', data: CustomData }

// ============================================
// BRICK FRONTMATTER (for backwards compatibility)
// ============================================

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

// Note: Brick type is defined in ~/composables/useBricks.ts
// Import from there directly to avoid duplicate exports

// ============================================
// CONFIGURATION FOR EACH BRICK TYPE
// ============================================

export interface BrickTypeConfig {
  label: string
  pluralLabel: string
  icon: string
  color: string
  description: string
  defaultData: () => unknown // Factory function for default structured data
}

export const BRICK_TYPE_CONFIG: Record<BrickType, BrickTypeConfig> = {
  experience: {
    label: 'Experience',
    pluralLabel: 'Work Experience',
    icon: 'i-lucide-briefcase',
    color: 'blue',
    description: 'Work history, jobs, and professional roles',
    defaultData: (): ExperienceData => ({
      jobTitle: '',
      company: '',
      location: '',
      locationType: '',
      isInternship: false,
      startDate: '',
      endDate: '',
      responsibilities: [''],
      achievements: [''],
      technologies: []
    })
  },
  education: {
    label: 'Education',
    pluralLabel: 'Education',
    icon: 'i-lucide-graduation-cap',
    color: 'purple',
    description: 'Degrees, certifications, and courses',
    defaultData: (): EducationData => ({
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
    })
  },
  project: {
    label: 'Project',
    pluralLabel: 'Projects',
    icon: 'i-lucide-code',
    color: 'green',
    description: 'Personal and professional projects',
    defaultData: (): ProjectData => ({
      name: '',
      role: '',
      description: '',
      problem: '',
      features: [''],
      technologies: [],
      outcome: '',
      links: [],
      isPersonal: true,
      date: ''
    })
  },
  skill: {
    label: 'Skill',
    pluralLabel: 'Skills',
    icon: 'i-lucide-wrench',
    color: 'amber',
    description: 'Technical skills, languages, and tools',
    defaultData: (): SkillData => ({
      name: '',
      category: 'technical',
      proficiency: 'intermediate',
      yearsOfExperience: 0,
      context: '',
      relatedProjects: []
    })
  },
  publication: {
    label: 'Publication',
    pluralLabel: 'Publications',
    icon: 'i-lucide-file-text',
    color: 'rose',
    description: 'Papers, articles, books, and patents',
    defaultData: (): PublicationData => ({
      title: '',
      authors: [''],
      publicationType: 'article',
      publicationName: '',
      date: '',
      abstract: '',
      contributions: [''],
      doi: '',
      url: '',
      citations: 0
    })
  },
  custom: {
    label: 'Custom',
    pluralLabel: 'Custom Sections',
    icon: 'i-lucide-puzzle',
    color: 'gray',
    description: 'Any custom content block',
    defaultData: (): CustomData => ({
      content: ''
    })
  }
}

export const BRICK_TYPES = Object.keys(BRICK_TYPE_CONFIG) as BrickType[]

export function getBrickTypeConfig(type: BrickType): BrickTypeConfig {
  return BRICK_TYPE_CONFIG[type]
}

// ============================================
// HELPER CONSTANTS
// ============================================

export const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical', description: 'Programming languages, frameworks' },
  { value: 'language', label: 'Language', description: 'Spoken/written languages' },
  { value: 'tool', label: 'Tool', description: 'Software, platforms, tools' },
  { value: 'soft', label: 'Soft Skill', description: 'Leadership, communication, etc.' },
  { value: 'other', label: 'Other', description: 'Other skills' }
] as const

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Learning/basic understanding' },
  { value: 'intermediate', label: 'Intermediate', description: 'Can work independently' },
  { value: 'advanced', label: 'Advanced', description: 'Deep knowledge, can mentor others' },
  { value: 'expert', label: 'Expert', description: 'Industry-recognized expertise' }
] as const

export const LOCATION_TYPES = [
  { value: '', label: 'Not specified' },
  { value: 'onsite', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
] as const

export const PUBLICATION_TYPES = [
  { value: 'journal', label: 'Journal Article' },
  { value: 'conference', label: 'Conference Paper' },
  { value: 'article', label: 'Article/Blog' },
  { value: 'book', label: 'Book/Chapter' },
  { value: 'patent', label: 'Patent' },
  { value: 'other', label: 'Other' }
] as const

export const DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/

export function normalizeDoi(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:/i, '')
}

export const GITHUB_REPO_REGEX = /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/

export function parseGitHubUrl(input: string): { owner: string, repo: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const match = trimmed.match(GITHUB_REPO_REGEX)
  if (!match) return null
  const owner = match[1]!
  const repo = match[2]!.replace(/\.git$/, '')
  return { owner, repo }
}

export const DEGREE_OPTIONS = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor of Science (BS)',
  'Bachelor of Arts (BA)',
  'Master of Science (MS)',
  'Master of Arts (MA)',
  'Master of Business Administration (MBA)',
  'Doctor of Philosophy (PhD)',
  'Professional Certificate',
  'Bootcamp Certificate',
  'Other'
]

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatDateRange(startDate?: string | null, endDate?: string | null, brickType?: BrickType): string {
  if (!startDate) return ''

  if (brickType === 'education') {
    const source = endDate || startDate
    const year = new Date(source).getFullYear()
    return endDate ? `${year}` : `Expected ${year}`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : 'Present'

  return `${start} - ${end}`
}

// Convert structured data to display-ready markdown/text
export function structuredDataToMarkdown(type: BrickType, data: unknown): string {
  switch (type) {
    case 'experience': {
      const exp = data as ExperienceData
      let md = ''
      if (exp.isInternship) {
        md += '**Internship**\n\n'
      }
      if (exp.responsibilities.filter(r => r.trim()).length > 0) {
        md += '## Responsibilities\n\n'
        exp.responsibilities.filter(r => r.trim()).forEach((r) => {
          md += `- ${r}\n`
        })
        md += '\n'
      }
      if (exp.achievements.filter(a => a.trim()).length > 0) {
        md += '## Achievements\n\n'
        exp.achievements.filter(a => a.trim()).forEach((a) => {
          md += `- ${a}\n`
        })
        md += '\n'
      }
      if (exp.technologies.length > 0) {
        md += `**Technologies:** ${exp.technologies.join(', ')}\n`
      }
      return md
    }
    case 'education': {
      const edu = data as EducationData
      let md = ''
      if (edu.coursework.length > 0) {
        md += '## Relevant Coursework\n\n'
        edu.coursework.forEach((c) => {
          md += `- ${c}\n`
        })
        md += '\n'
      }
      if (edu.honors.length > 0) {
        md += `**Honors:** ${edu.honors.join(', ')}\n\n`
      }
      if (edu.activities.length > 0) {
        md += '## Activities\n\n'
        edu.activities.forEach((a) => {
          md += `- ${a}\n`
        })
      }
      if (edu.thesis) {
        md += `\n**Thesis:** ${edu.thesis}\n`
      }
      return md
    }
    case 'project': {
      const proj = data as ProjectData
      let md = ''
      if (proj.description) {
        md += `${proj.description}\n\n`
      }
      if (proj.problem) {
        md += `**Problem:** ${proj.problem}\n\n`
      }
      if (proj.features.filter(f => f.trim()).length > 0) {
        md += '## Key Features\n\n'
        proj.features.filter(f => f.trim()).forEach((f) => {
          md += `- ${f}\n`
        })
        md += '\n'
      }
      if (proj.technologies.length > 0) {
        md += `**Tech Stack:** ${proj.technologies.join(', ')}\n\n`
      }
      if (proj.outcome) {
        md += `**Outcome:** ${proj.outcome}\n`
      }
      return md
    }
    case 'skill': {
      const skill = data as SkillData
      let md = `**Proficiency:** ${skill.proficiency}\n\n`
      if (skill.yearsOfExperience > 0) {
        md += `**Experience:** ${skill.yearsOfExperience} year${skill.yearsOfExperience > 1 ? 's' : ''}\n\n`
      }
      if (skill.context) {
        md += `${skill.context}\n`
      }
      return md
    }
    case 'publication': {
      const pub = data as PublicationData
      let md = ''
      if (pub.authors.length > 0) {
        md += `**Authors:** ${pub.authors.join(', ')}\n\n`
      }
      if (pub.abstract) {
        md += `## Abstract\n\n${pub.abstract}\n\n`
      }
      if (pub.contributions.filter(c => c.trim()).length > 0) {
        md += '## Key Contributions\n\n'
        pub.contributions.filter(c => c.trim()).forEach((c) => {
          md += `- ${c}\n`
        })
      }
      return md
    }
    case 'custom': {
      const custom = data as CustomData
      return custom.content
    }
    default:
      return ''
  }
}
