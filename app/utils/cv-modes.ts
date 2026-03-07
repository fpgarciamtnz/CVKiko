import type { BrickType } from './brick-types'

export type CVMode = 'industry' | 'academic'

export const CV_MODE_CONFIG: Record<CVMode, {
  label: string
  description: string
  defaultSectionOrder: BrickType[]
  headerTitle: string
}> = {
  industry: {
    label: 'Industry',
    description: 'Optimized for corporate and startup roles',
    defaultSectionOrder: ['experience', 'education', 'project', 'skill', 'publication', 'custom'],
    headerTitle: 'Resume'
  },
  academic: {
    label: 'Academic',
    description: 'Comprehensive CV for academic positions',
    defaultSectionOrder: ['education', 'experience', 'publication', 'teaching', 'grant', 'presentation', 'award', 'service', 'project', 'skill', 'custom'],
    headerTitle: 'Curriculum Vitae'
  }
}

export const CV_MODES = Object.keys(CV_MODE_CONFIG) as CVMode[]
