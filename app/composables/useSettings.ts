export interface PdfLayoutRule {
  enforceOnePage: boolean
  compactContactsInline: boolean
  minScale: number
  targetPage: 'A4'
}

export const DEFAULT_PDF_LAYOUT_RULE: PdfLayoutRule = {
  enforceOnePage: true,
  compactContactsInline: true,
  minScale: 0.72,
  targetPage: 'A4'
}

export interface Settings {
  id: string
  name: string
  email: string | null
  phone: string | null
  location: string | null
  summary: string | null
  linkedIn: string | null
  github: string | null
  website: string | null
  orcid: string | null
  pronouns: string | null
  academicTitle: string | null
  department: string | null
  institution: string | null
  pdfLayoutRule?: PdfLayoutRule | null
  updatedAt: string | null
}

export function normalizePdfLayoutRule(rule?: Partial<PdfLayoutRule> | null): PdfLayoutRule {
  const minScale = Number(rule?.minScale)
  const clampedMinScale = Number.isFinite(minScale)
    ? Math.min(1, Math.max(0.5, minScale))
    : DEFAULT_PDF_LAYOUT_RULE.minScale

  return {
    enforceOnePage: typeof rule?.enforceOnePage === 'boolean'
      ? rule.enforceOnePage
      : DEFAULT_PDF_LAYOUT_RULE.enforceOnePage,
    compactContactsInline: typeof rule?.compactContactsInline === 'boolean'
      ? rule.compactContactsInline
      : DEFAULT_PDF_LAYOUT_RULE.compactContactsInline,
    minScale: clampedMinScale,
    targetPage: rule?.targetPage === 'A4'
      ? rule.targetPage
      : DEFAULT_PDF_LAYOUT_RULE.targetPage
  }
}

function normalizeSettingsPayload(payload: Settings): Settings {
  return {
    ...payload,
    pdfLayoutRule: normalizePdfLayoutRule(payload.pdfLayoutRule)
  }
}

export function useSettings() {
  const settings = useState<Settings | null>('settings', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      const payload = await $fetch<Settings>('/api/settings')
      settings.value = normalizeSettingsPayload(payload)
    } catch (e) {
      error.value = 'Failed to load settings'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (updates: Partial<Settings>) => {
    loading.value = true
    error.value = null
    try {
      const payload = await $fetch<Settings>('/api/settings', {
        method: 'PUT',
        body: updates
      })
      settings.value = normalizeSettingsPayload(payload)
      return settings.value
    } catch (e) {
      error.value = 'Failed to update settings'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    normalizePdfLayoutRule
  }
}
