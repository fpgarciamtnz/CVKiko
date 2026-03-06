import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock $fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

const mockCV = (id: string = '1') => ({
  id,
  name: `CV ${id}`,
  slug: `cv-${id}`,
  isPublished: false,
  targetRole: null,
  targetCompany: null,
  jobDescription: null,
  templateId: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  brickIds: []
})

describe('useSavedCVs', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    const { savedCVs } = useSavedCVs()
    savedCVs.value = []
  })

  describe('fetchCVs', () => {
    it('populates savedCVs ref', async () => {
      const data = [mockCV('1'), mockCV('2')]
      fetchMock.mockResolvedValue(data)

      const { savedCVs, fetchCVs } = useSavedCVs()
      await fetchCVs()

      expect(savedCVs.value).toEqual(data)
    })

    it('sets error on failure', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'DB error' } })

      const { error, fetchCVs } = useSavedCVs()
      await fetchCVs()

      expect(error.value).toBe('DB error')
    })
  })

  describe('saveCV', () => {
    it('POSTs and appends to array', async () => {
      const created = mockCV('new')
      fetchMock.mockResolvedValue(created)

      const { savedCVs, saveCV } = useSavedCVs()
      await saveCV({ name: 'My CV', brickIds: ['a', 'b'] })

      expect(fetchMock).toHaveBeenCalledWith('/api/cvs', {
        method: 'POST',
        body: { name: 'My CV', brickIds: ['a', 'b'] }
      })
      expect(savedCVs.value).toHaveLength(1)
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue(new Error('Save failed'))

      const { error, saveCV } = useSavedCVs()
      await expect(saveCV({ name: 'Bad', brickIds: [] })).rejects.toBeTruthy()
      expect(error.value).toBe('Save failed')
    })
  })

  describe('updateCV', () => {
    it('PUTs and replaces in array', async () => {
      const updated = { ...mockCV('1'), name: 'Updated CV' }
      fetchMock.mockResolvedValue(updated)

      const { savedCVs, updateCV } = useSavedCVs()
      savedCVs.value = [mockCV('1')]
      await updateCV('1', { name: 'Updated CV' })

      expect(savedCVs.value[0]!.name).toBe('Updated CV')
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Not found' } })

      const { error, updateCV } = useSavedCVs()
      await expect(updateCV('missing', {})).rejects.toBeTruthy()
      expect(error.value).toBe('Not found')
    })
  })

  describe('deleteCV', () => {
    it('DELETEs and removes from array', async () => {
      fetchMock.mockResolvedValue(undefined)

      const { savedCVs, deleteCV } = useSavedCVs()
      savedCVs.value = [mockCV('1'), mockCV('2')]
      await deleteCV('1')

      expect(savedCVs.value).toHaveLength(1)
      expect(savedCVs.value[0]!.id).toBe('2')
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue({})

      const { error, deleteCV } = useSavedCVs()
      await expect(deleteCV('1')).rejects.toBeTruthy()
      expect(error.value).toBe('Failed to delete CV')
    })
  })

  describe('error extraction edge cases', () => {
    it('extracts from { data: { message } }', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Custom error' } })

      const { error, fetchCVs } = useSavedCVs()
      await fetchCVs()

      expect(error.value).toBe('Custom error')
    })

    it('falls back to Error.message', async () => {
      fetchMock.mockRejectedValue(new Error('Net error'))

      const { error, fetchCVs } = useSavedCVs()
      await fetchCVs()

      expect(error.value).toBe('Net error')
    })

    it('falls back to default message', async () => {
      fetchMock.mockRejectedValue(42) // not an object with data or message

      const { error, fetchCVs } = useSavedCVs()
      await fetchCVs()

      expect(error.value).toBe('Failed to load CVs')
    })
  })
})
