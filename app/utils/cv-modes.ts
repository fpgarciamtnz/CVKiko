import type { BrickType } from './brick-types'

export type CVMode = 'industry' | 'academic'

export const CV_MODE_CONFIG: Record<CVMode, {
  label: string
  description: string
  defaultSectionOrder: BrickType[]
  headerTitle: string
}> = {
  industry: {
    label: 'Industria',
    description: 'Optimizado para puestos corporativos y de startups',
    defaultSectionOrder: ['experience', 'education', 'project', 'skill', 'publication', 'custom'],
    headerTitle: 'Curriculum'
  },
  academic: {
    label: 'Academico',
    description: 'CV completo para posiciones academicas',
    defaultSectionOrder: ['education', 'experience', 'publication', 'teaching', 'grant', 'presentation', 'award', 'service', 'project', 'skill', 'custom'],
    headerTitle: 'Curriculum Vitae'
  }
}

export const CV_MODES = Object.keys(CV_MODE_CONFIG) as CVMode[]
