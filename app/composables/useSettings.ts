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
  updatedAt: string | null
}

export function useSettings() {
  const settings = useState<Settings | null>('settings', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      settings.value = await $fetch<Settings>('/api/settings')
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
      settings.value = await $fetch<Settings>('/api/settings', {
        method: 'PUT',
        body: updates
      })
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
    updateSettings
  }
}
