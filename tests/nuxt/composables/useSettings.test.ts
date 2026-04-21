import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock $fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

const mockSettings = () => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: null,
  location: 'NYC',
  summary: null,
  linkedIn: null,
  github: null,
  website: null,
  pdfLayoutRule: {
    enforceOnePage: true,
    compactContactsInline: true,
    minScale: 0.72,
    targetPage: 'A4'
  },
  updatedAt: '2024-01-01'
})

describe('useSettings', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    const { settings } = useSettings()
    settings.value = null
  })

  describe('fetchSettings', () => {
    it('populates settings ref', async () => {
      const data = mockSettings()
      fetchMock.mockResolvedValue(data)

      const { settings, fetchSettings } = useSettings()
      await fetchSettings()

      expect(settings.value).toEqual(data)
    })

    it('sets error on failure', async () => {
      fetchMock.mockRejectedValue(new Error('fail'))

      const { error, fetchSettings } = useSettings()
      await fetchSettings()

      expect(error.value).toBe('Failed to load settings')
    })

    it('loading is true during fetch, false after', async () => {
      fetchMock.mockResolvedValue(mockSettings())

      const { loading, fetchSettings } = useSettings()
      const promise = fetchSettings()
      expect(loading.value).toBe(true)

      await promise
      expect(loading.value).toBe(false)
    })
  })

  describe('updateSettings', () => {
    it('PUTs and updates settings ref', async () => {
      const updated = { ...mockSettings(), name: 'Jane Doe' }
      fetchMock.mockResolvedValue(updated)

      const { settings, updateSettings } = useSettings()
      await updateSettings({ name: 'Jane Doe' })

      expect(fetchMock).toHaveBeenCalledWith('/api/settings', {
        method: 'PUT',
        body: { name: 'Jane Doe' }
      })
      expect(settings.value?.name).toBe('Jane Doe')
    })

    it('sets error on failure and throws', async () => {
      fetchMock.mockRejectedValue(new Error('fail'))

      const { error, updateSettings } = useSettings()
      await expect(updateSettings({ name: 'Bad' })).rejects.toBeTruthy()
      expect(error.value).toBe('Failed to update settings')
    })
  })

  it('normalizes invalid pdf layout rules from API payload', async () => {
    fetchMock.mockResolvedValue({
      ...mockSettings(),
      pdfLayoutRule: {
        enforceOnePage: 'yes',
        compactContactsInline: null,
        minScale: 8,
        targetPage: 'Letter'
      }
    })

    const { settings, fetchSettings } = useSettings()
    await fetchSettings()

    expect(settings.value?.pdfLayoutRule).toEqual({
      enforceOnePage: true,
      compactContactsInline: true,
      minScale: 1,
      targetPage: 'A4'
    })
  })
})
