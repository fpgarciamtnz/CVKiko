export interface SavedCV {
  id: string
  name: string
  slug: string | null
  isPublished: boolean
  targetRole: string | null
  targetCompany: string | null
  jobDescription: string | null
  templateId: string | null
  createdAt: string
  updatedAt: string
  brickIds?: string[]
}

export function useSavedCVs() {
  const savedCVs = useState<SavedCV[]>('savedCVs', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function extractErrorMessage(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'data' in e) {
      const data = (e as { data?: { message?: string } }).data
      if (data?.message) return data.message
    }
    if (e instanceof Error) return e.message
    return fallback
  }

  const fetchCVs = async () => {
    loading.value = true
    error.value = null
    try {
      savedCVs.value = await $fetch<SavedCV[]>('/api/cvs')
    } catch (e) {
      error.value = extractErrorMessage(e, 'Failed to load CVs')
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const saveCV = async (data: { name: string, slug?: string, brickIds: string[] }) => {
    loading.value = true
    error.value = null
    try {
      const created = await $fetch<SavedCV>('/api/cvs', {
        method: 'POST',
        body: data
      })
      savedCVs.value.push(created)
      return created
    } catch (e) {
      error.value = extractErrorMessage(e, 'Failed to save CV')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateCV = async (id: string, updates: Partial<{ name: string, slug: string, brickIds: string[], isPublished: boolean }>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<SavedCV>(`/api/cvs/${id}`, {
        method: 'PUT',
        body: updates
      })
      const index = savedCVs.value.findIndex(cv => cv.id === id)
      if (index !== -1) savedCVs.value[index] = updated
      return updated
    } catch (e) {
      error.value = extractErrorMessage(e, 'Failed to update CV')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteCV = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/cvs/${id}`, { method: 'DELETE' })
      savedCVs.value = savedCVs.value.filter(cv => cv.id !== id)
    } catch (e) {
      error.value = extractErrorMessage(e, 'Failed to delete CV')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    savedCVs,
    loading,
    error,
    fetchCVs,
    saveCV,
    updateCV,
    deleteCV
  }
}
