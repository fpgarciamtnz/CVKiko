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
  startDate: string
  endDate: string
  isCurrent: boolean
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
    label: 'Experiencia',
    pluralLabel: 'Experiencia Profesional',
    icon: 'i-lucide-briefcase',
    color: 'blue',
    description: 'Historial laboral, empleos y roles profesionales',
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
    label: 'Educacion',
    pluralLabel: 'Educacion',
    icon: 'i-lucide-graduation-cap',
    color: 'purple',
    description: 'Titulos, certificaciones y cursos',
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
    label: 'Proyecto',
    pluralLabel: 'Proyectos',
    icon: 'i-lucide-code',
    color: 'green',
    description: 'Proyectos personales y profesionales',
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
    label: 'Habilidad',
    pluralLabel: 'Habilidades',
    icon: 'i-lucide-wrench',
    color: 'amber',
    description: 'Habilidades tecnicas, idiomas y herramientas',
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
    label: 'Publicacion',
    pluralLabel: 'Publicaciones',
    icon: 'i-lucide-file-text',
    color: 'rose',
    description: 'Articulos, papers, libros y patentes',
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
    label: 'Otro',
    pluralLabel: 'Otros',
    icon: 'i-lucide-puzzle',
    color: 'gray',
    description: 'Cualquier bloque de contenido personalizado',
    defaultData: (): CustomData => ({
      content: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    })
  },
  teaching: {
    label: 'Docencia',
    pluralLabel: 'Experiencia Docente',
    icon: 'i-lucide-presentation',
    color: 'teal',
    description: 'Cursos impartidos, ayudantias y mentoria',
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
    label: 'Beca',
    pluralLabel: 'Becas y Financiacion',
    icon: 'i-lucide-banknote',
    color: 'emerald',
    description: 'Becas y fondos de investigacion',
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
    label: 'Presentacion',
    pluralLabel: 'Presentaciones',
    icon: 'i-lucide-mic',
    color: 'violet',
    description: 'Charlas, posters y presentaciones en conferencias',
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
    label: 'Premio',
    pluralLabel: 'Premios y Honores',
    icon: 'i-lucide-trophy',
    color: 'yellow',
    description: 'Premios, honores, fellowships y becas',
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
    label: 'Servicio',
    pluralLabel: 'Servicio Profesional',
    icon: 'i-lucide-handshake',
    color: 'sky',
    description: 'Roles editoriales, revision, comites y mentoria',
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
  { value: 'technical', label: 'Tecnica', description: 'Lenguajes de programacion y frameworks' },
  { value: 'language', label: 'Idioma', description: 'Idiomas hablados y escritos' },
  { value: 'tool', label: 'Herramienta', description: 'Software, plataformas y herramientas' },
  { value: 'soft', label: 'Habilidad Blanda', description: 'Liderazgo, comunicacion, etc.' },
  { value: 'other', label: 'Otra', description: 'Otras habilidades' }
] as const

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Principiante', description: 'Aprendiendo / comprension basica' },
  { value: 'intermediate', label: 'Intermedio', description: 'Puede trabajar de forma independiente' },
  { value: 'advanced', label: 'Avanzado', description: 'Conocimiento profundo, puede guiar a otros' },
  { value: 'expert', label: 'Experto', description: 'Experiencia reconocida en la industria' }
] as const

export const LOCATION_TYPES = [
  { value: '', label: 'No especificado' },
  { value: 'onsite', label: 'Presencial' },
  { value: 'remote', label: 'Remoto' },
  { value: 'hybrid', label: 'Hibrido' }
] as const

export const PUBLICATION_TYPES = [
  { value: 'journal', label: 'Articulo de Revista' },
  { value: 'conference', label: 'Paper de Conferencia' },
  { value: 'article', label: 'Articulo / Blog' },
  { value: 'book', label: 'Libro / Capitulo' },
  { value: 'patent', label: 'Patente' },
  { value: 'other', label: 'Otro' }
] as const

export const PUBLICATION_STATUSES = [
  { value: '', label: 'No especificado' },
  { value: 'published', label: 'Publicado' },
  { value: 'in_press', label: 'En Prensa' },
  { value: 'accepted', label: 'Aceptado' },
  { value: 'under_review', label: 'En Revision' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'preprint', label: 'Preprint' }
] as const

export const PRESENTATION_TYPES = [
  { value: 'talk', label: 'Charla' },
  { value: 'poster', label: 'Poster' },
  { value: 'keynote', label: 'Keynote' },
  { value: 'invited', label: 'Charla Invitada' },
  { value: 'panel', label: 'Panel' },
  { value: 'workshop', label: 'Taller' },
  { value: 'other', label: 'Otro' }
] as const

export const GRANT_STATUSES = [
  { value: '', label: 'No especificado' },
  { value: 'awarded', label: 'Otorgado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'declined', label: 'Rechazado' }
] as const

export const GRANT_ROLES = [
  { value: '', label: 'No especificado' },
  { value: 'PI', label: 'Investigador Principal (PI)' },
  { value: 'Co-PI', label: 'Co-Investigador Principal' },
  { value: 'Co-I', label: 'Co-Investigador' },
  { value: 'Senior Personnel', label: 'Personal Senior' },
  { value: 'Consultant', label: 'Consultor' }
] as const

export const SERVICE_TYPES = [
  { value: 'editorial', label: 'Comite Editorial' },
  { value: 'review', label: 'Revision por Pares' },
  { value: 'committee', label: 'Comite' },
  { value: 'mentoring', label: 'Mentoria' },
  { value: 'organizing', label: 'Organizacion de Eventos' },
  { value: 'other', label: 'Otro' }
] as const

export const AWARD_CATEGORIES = [
  { value: 'award', label: 'Premio' },
  { value: 'honor', label: 'Honor' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'scholarship', label: 'Beca' },
  { value: 'other', label: 'Otro' }
] as const

export const TEACHING_STUDENT_LEVELS = [
  { value: '', label: 'No especificado' },
  { value: 'undergraduate', label: 'Grado' },
  { value: 'graduate', label: 'Posgrado' },
  { value: 'doctoral', label: 'Doctoral' },
  { value: 'mixed', label: 'Mixto' }
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
  'Diploma de Secundaria',
  'Titulo de Tecnico Superior',
  'Grado en Ciencias (BS)',
  'Grado en Artes (BA)',
  'Master en Ciencias (MS)',
  'Master en Artes (MA)',
  'Master en Administracion (MBA)',
  'Doctorado (PhD)',
  'Certificado Profesional',
  'Certificado de Bootcamp',
  'Otro'
]

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatDateRange(startDate?: string | null, endDate?: string | null, brickType?: BrickType): string {
  if (!startDate) return ''

  if (brickType === 'education') {
    const source = endDate || startDate
    const year = new Date(source).getFullYear()
    return endDate ? `${year}` : `Esperado ${year}`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  }

  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : 'Actualidad'

  return `${start} - ${end}`
}

interface BrickDateSource {
  type: BrickType
  frontmatter?: BrickFrontmatter | null
  structuredData?: Record<string, unknown> | null
}

function asDateString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

// Keep date rendering consistent across cards, preview, and PDF.
export function formatBrickDateRange(brick: BrickDateSource): string {
  const fmStart = asDateString(brick.frontmatter?.startDate)
  const fmEnd = asDateString(brick.frontmatter?.endDate)

  if (brick.type === 'experience') {
    const exp = (brick.structuredData || {}) as Partial<ExperienceData>
    const expStart = asDateString(exp.startDate)
    const hasExpEnd = typeof exp.endDate === 'string'
    const expEnd = hasExpEnd ? asDateString(exp.endDate) : ''

    const start = expStart || fmStart
    const end = hasExpEnd ? expEnd : fmEnd
    return formatDateRange(start, end, brick.type)
  }

  return formatDateRange(fmStart, fmEnd, brick.type)
}

// Convert structured data to display-ready markdown/text
export function structuredDataToMarkdown(type: BrickType, data: unknown): string {
  switch (type) {
    case 'experience': {
      const exp = data as ExperienceData
      let md = ''
      if (exp.isInternship) {
        md += '**Practicas**\n\n'
      }
      const responsibilities = exp.responsibilities.filter(r => r.trim())
      const achievements = exp.achievements.filter(a => a.trim())
      if (responsibilities.length > 0 || achievements.length > 0) {
        responsibilities.forEach((r) => {
          md += `- ${r}\n`
        })
        achievements.forEach((a) => {
          md += `- ${a}\n`
        })
        md += '\n'
      }
      if (exp.technologies.length > 0) {
        md += `**Tecnologias:** ${exp.technologies.join(', ')}\n`
      }
      return md
    }
    case 'education': {
      const edu = data as EducationData
      let md = ''
      if (edu.coursework.length > 0) {
        md += '## Cursos Relevantes\n\n'
        edu.coursework.forEach((c) => {
          md += `- ${c}\n`
        })
        md += '\n'
      }
      if (edu.honors.length > 0) {
        md += `**Honores:** ${edu.honors.join(', ')}\n\n`
      }
      if (edu.activities.length > 0) {
        md += '## Actividades\n\n'
        edu.activities.forEach((a) => {
          md += `- ${a}\n`
        })
      }
      if (edu.thesis) {
        md += `\n**Tesis:** ${edu.thesis}\n`
      }
      return md
    }
    case 'project': {
      const proj = data as ProjectData
      let md = ''
      if (proj.description) {
        md += `${proj.description}\n`
      }
      if (proj.problem) {
        md += `${md ? '\n' : ''}**Objetivo:** ${proj.problem}\n`
      }
      const features = proj.features.filter(f => f.trim())
      if (features.length > 0) {
        md += `${md ? '\n' : ''}**Puntos Clave:** ${features.join('; ')}\n`
      }
      if (proj.technologies.length > 0) {
        md += `${md ? '\n' : ''}**Stack Tecnologico:** ${proj.technologies.join(', ')}\n`
      }
      if (proj.outcome) {
        md += `${md ? '\n' : ''}**Resultado:** ${proj.outcome}\n`
      }
      return md
    }
    case 'skill': {
      const skill = data as SkillData
      let md = `**Nivel:** ${skill.proficiency}\n\n`
      if (skill.yearsOfExperience > 0) {
        md += `**Experiencia:** ${skill.yearsOfExperience} ano${skill.yearsOfExperience > 1 ? 's' : ''}\n\n`
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
        md += `**Autores:** ${pub.authors.join(', ')}\n`
      }
      if (pub.status) {
        const statusLabel = PUBLICATION_STATUSES.find(s => s.value === pub.status)?.label || pub.status
        md += `${md ? '\n' : ''}**Estado:** ${statusLabel}\n`
      }
      const contributions = pub.contributions.filter(c => c.trim())
      if (contributions.length > 0) {
        md += `${md ? '\n' : ''}**Contribuciones:** ${contributions.join('; ')}\n`
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
        md += `**Curso:** ${t.courseCode} - ${t.courseName}\n\n`
      }
      if (t.department) {
        md += `**Departamento:** ${t.department}\n\n`
      }
      if (t.studentLevel) {
        const levelLabel = TEACHING_STUDENT_LEVELS.find(l => l.value === t.studentLevel)?.label || t.studentLevel
        md += `**Nivel:** ${levelLabel}`
        if (t.enrollmentSize > 0) {
          md += ` (${t.enrollmentSize} estudiantes)`
        }
        md += '\n\n'
      }
      if (t.responsibilities.filter(r => r.trim()).length > 0) {
        md += '## Responsabilidades\n\n'
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
        md += `**Entidad Financiadora:** ${g.fundingAgency}\n\n`
      }
      if (g.role) {
        md += `**Rol:** ${g.role}\n\n`
      }
      if (g.amount) {
        md += `**Monto:** ${g.amount}\n\n`
      }
      if (g.status) {
        const statusLabel = GRANT_STATUSES.find(s => s.value === g.status)?.label || g.status
        md += `**Estado:** ${statusLabel}\n\n`
      }
      if (g.grantNumber) {
        md += `**Beca #:** ${g.grantNumber}\n\n`
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
      md += `**Tipo:** ${typeLabel}`
      if (p.isInvited) {
        md += ' (Invitada)'
      }
      md += '\n\n'
      if (p.event) {
        md += `**Evento:** ${p.event}\n\n`
      }
      if (p.coAuthors.length > 0) {
        md += `**Coautores:** ${p.coAuthors.join(', ')}\n\n`
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
        md += `**Otorgado por:** ${a.organization}\n\n`
      }
      if (a.amount) {
        md += `**Monto:** ${a.amount}\n\n`
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
      md += `**Tipo:** ${typeLabel}\n\n`
      if (s.organization) {
        md += `**Organizacion:** ${s.organization}\n\n`
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
