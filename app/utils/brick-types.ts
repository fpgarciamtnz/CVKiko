export type BrickType = 'experience' | 'education' | 'project' | 'skill' | 'publication' | 'custom' | 'teaching' | 'grant' | 'presentation' | 'award' | 'service'

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
  status: 'published' | 'in_press' | 'under_review' | 'accepted' | 'submitted' | 'preprint' | ''
  authorHighlightName: string // Name to bold in author lists
}

export interface CustomData {
  content: string // Markdown content for flexible blocks
}

export interface TeachingData {
  role: string
  courseName: string
  courseCode: string
  institution: string
  department: string
  startDate: string
  endDate: string
  responsibilities: string[]
  studentLevel: 'undergraduate' | 'graduate' | 'doctoral' | 'mixed' | ''
  enrollmentSize: number
}

export interface GrantData {
  title: string
  fundingAgency: string
  role: 'PI' | 'Co-PI' | 'Co-I' | 'Senior Personnel' | 'Consultant' | ''
  amount: string
  startDate: string
  endDate: string
  status: 'awarded' | 'pending' | 'completed' | 'declined' | ''
  grantNumber: string
  description: string
}

export interface PresentationData {
  title: string
  presentationType: 'talk' | 'poster' | 'keynote' | 'invited' | 'panel' | 'workshop' | 'other'
  event: string
  location: string
  date: string
  isInvited: boolean
  abstract: string
  coAuthors: string[]
  url: string
}

export interface AwardData {
  name: string
  organization: string
  date: string
  description: string
  amount: string
  category: 'award' | 'honor' | 'fellowship' | 'scholarship' | 'other'
}

export interface ServiceData {
  role: string
  organization: string
  serviceType: 'editorial' | 'review' | 'committee' | 'mentoring' | 'organizing' | 'other'
  startDate: string
  endDate: string
  description: string
}

// Union type for all brick data
export type BrickData
  = | { type: 'experience', data: ExperienceData }
    | { type: 'education', data: EducationData }
    | { type: 'project', data: ProjectData }
    | { type: 'skill', data: SkillData }
    | { type: 'publication', data: PublicationData }
    | { type: 'custom', data: CustomData }
    | { type: 'teaching', data: TeachingData }
    | { type: 'grant', data: GrantData }
    | { type: 'presentation', data: PresentationData }
    | { type: 'award', data: AwardData }
    | { type: 'service', data: ServiceData }

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
      citations: 0,
      status: '',
      authorHighlightName: ''
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
  },
  teaching: {
    label: 'Teaching',
    pluralLabel: 'Teaching Experience',
    icon: 'i-lucide-presentation',
    color: 'teal',
    description: 'Courses taught, TA positions, and mentoring',
    defaultData: (): TeachingData => ({
      role: '',
      courseName: '',
      courseCode: '',
      institution: '',
      department: '',
      startDate: '',
      endDate: '',
      responsibilities: [''],
      studentLevel: '',
      enrollmentSize: 0
    })
  },
  grant: {
    label: 'Grant',
    pluralLabel: 'Grants & Funding',
    icon: 'i-lucide-banknote',
    color: 'emerald',
    description: 'Research grants and funding awards',
    defaultData: (): GrantData => ({
      title: '',
      fundingAgency: '',
      role: '',
      amount: '',
      startDate: '',
      endDate: '',
      status: '',
      grantNumber: '',
      description: ''
    })
  },
  presentation: {
    label: 'Presentation',
    pluralLabel: 'Presentations',
    icon: 'i-lucide-mic',
    color: 'violet',
    description: 'Talks, posters, and conference presentations',
    defaultData: (): PresentationData => ({
      title: '',
      presentationType: 'talk',
      event: '',
      location: '',
      date: '',
      isInvited: false,
      abstract: '',
      coAuthors: [],
      url: ''
    })
  },
  award: {
    label: 'Award',
    pluralLabel: 'Awards & Honors',
    icon: 'i-lucide-trophy',
    color: 'yellow',
    description: 'Awards, honors, fellowships, and scholarships',
    defaultData: (): AwardData => ({
      name: '',
      organization: '',
      date: '',
      description: '',
      amount: '',
      category: 'award'
    })
  },
  service: {
    label: 'Service',
    pluralLabel: 'Professional Service',
    icon: 'i-lucide-handshake',
    color: 'sky',
    description: 'Editorial, review, committee, and mentoring roles',
    defaultData: (): ServiceData => ({
      role: '',
      organization: '',
      serviceType: 'committee',
      startDate: '',
      endDate: '',
      description: ''
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

export const PUBLICATION_STATUSES = [
  { value: '', label: 'Not specified' },
  { value: 'published', label: 'Published' },
  { value: 'in_press', label: 'In Press' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'preprint', label: 'Preprint' }
] as const

export const PRESENTATION_TYPES = [
  { value: 'talk', label: 'Talk' },
  { value: 'poster', label: 'Poster' },
  { value: 'keynote', label: 'Keynote' },
  { value: 'invited', label: 'Invited Talk' },
  { value: 'panel', label: 'Panel' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' }
] as const

export const GRANT_STATUSES = [
  { value: '', label: 'Not specified' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' }
] as const

export const GRANT_ROLES = [
  { value: '', label: 'Not specified' },
  { value: 'PI', label: 'Principal Investigator (PI)' },
  { value: 'Co-PI', label: 'Co-Principal Investigator' },
  { value: 'Co-I', label: 'Co-Investigator' },
  { value: 'Senior Personnel', label: 'Senior Personnel' },
  { value: 'Consultant', label: 'Consultant' }
] as const

export const SERVICE_TYPES = [
  { value: 'editorial', label: 'Editorial Board' },
  { value: 'review', label: 'Peer Review' },
  { value: 'committee', label: 'Committee' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'organizing', label: 'Event Organizing' },
  { value: 'other', label: 'Other' }
] as const

export const AWARD_CATEGORIES = [
  { value: 'award', label: 'Award' },
  { value: 'honor', label: 'Honor' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'other', label: 'Other' }
] as const

export const TEACHING_STUDENT_LEVELS = [
  { value: '', label: 'Not specified' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'doctoral', label: 'Doctoral' },
  { value: 'mixed', label: 'Mixed' }
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
      if (pub.status) {
        const statusLabel = PUBLICATION_STATUSES.find(s => s.value === pub.status)?.label || pub.status
        md += `**Status:** ${statusLabel}\n\n`
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
    case 'teaching': {
      const t = data as TeachingData
      let md = ''
      if (t.courseCode) {
        md += `**Course:** ${t.courseCode} - ${t.courseName}\n\n`
      }
      if (t.department) {
        md += `**Department:** ${t.department}\n\n`
      }
      if (t.studentLevel) {
        const levelLabel = TEACHING_STUDENT_LEVELS.find(l => l.value === t.studentLevel)?.label || t.studentLevel
        md += `**Level:** ${levelLabel}`
        if (t.enrollmentSize > 0) {
          md += ` (${t.enrollmentSize} students)`
        }
        md += '\n\n'
      }
      if (t.responsibilities.filter(r => r.trim()).length > 0) {
        md += '## Responsibilities\n\n'
        t.responsibilities.filter(r => r.trim()).forEach((r) => {
          md += `- ${r}\n`
        })
      }
      return md
    }
    case 'grant': {
      const g = data as GrantData
      let md = ''
      if (g.fundingAgency) {
        md += `**Funding Agency:** ${g.fundingAgency}\n\n`
      }
      if (g.role) {
        md += `**Role:** ${g.role}\n\n`
      }
      if (g.amount) {
        md += `**Amount:** ${g.amount}\n\n`
      }
      if (g.status) {
        const statusLabel = GRANT_STATUSES.find(s => s.value === g.status)?.label || g.status
        md += `**Status:** ${statusLabel}\n\n`
      }
      if (g.grantNumber) {
        md += `**Grant #:** ${g.grantNumber}\n\n`
      }
      if (g.description) {
        md += `${g.description}\n`
      }
      return md
    }
    case 'presentation': {
      const p = data as PresentationData
      let md = ''
      const typeLabel = PRESENTATION_TYPES.find(t => t.value === p.presentationType)?.label || p.presentationType
      md += `**Type:** ${typeLabel}`
      if (p.isInvited) {
        md += ' (Invited)'
      }
      md += '\n\n'
      if (p.event) {
        md += `**Event:** ${p.event}\n\n`
      }
      if (p.coAuthors.length > 0) {
        md += `**Co-Authors:** ${p.coAuthors.join(', ')}\n\n`
      }
      if (p.abstract) {
        md += `${p.abstract}\n`
      }
      return md
    }
    case 'award': {
      const a = data as AwardData
      let md = ''
      if (a.organization) {
        md += `**Awarded by:** ${a.organization}\n\n`
      }
      if (a.amount) {
        md += `**Amount:** ${a.amount}\n\n`
      }
      if (a.description) {
        md += `${a.description}\n`
      }
      return md
    }
    case 'service': {
      const s = data as ServiceData
      let md = ''
      const typeLabel = SERVICE_TYPES.find(t => t.value === s.serviceType)?.label || s.serviceType
      md += `**Type:** ${typeLabel}\n\n`
      if (s.organization) {
        md += `**Organization:** ${s.organization}\n\n`
      }
      if (s.description) {
        md += `${s.description}\n`
      }
      return md
    }
    default:
      return ''
  }
}
