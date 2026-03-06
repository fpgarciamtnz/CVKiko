import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock $fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

const mockBrick = (id: string, type: string = 'experience') => ({
  id,
  type,
  title: `Brick ${id}`,
  content: '',
  tags: [],
  frontmatter: {},
  structuredData: {},
  isActive: true,
  sortOrder: 0,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
})

describe('useBricks', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    // Reset shared state
    const { bricks } = useBricks()
    bricks.value = []
  })

  describe('fetchBricks', () => {
    it('populates bricks ref', async () => {
      const mockData = [mockBrick('1'), mockBrick('2')]
      fetchMock.mockResolvedValue(mockData)

      const { bricks, fetchBricks } = useBricks()
      await fetchBricks()

      expect(bricks.value).toEqual(mockData)
    })

    it('calls ?type=experience when type provided', async () => {
      fetchMock.mockResolvedValue([])

      const { fetchBricks } = useBricks()
      await fetchBricks('experience')

      expect(fetchMock).toHaveBeenCalledWith('/api/bricks?type=experience')
    })

    it('loading is true during fetch, false after', async () => {
      let resolveFetch: (v: unknown) => void
      fetchMock.mockImplementation(() => new Promise((resolve) => {
        resolveFetch = resolve
      }))

      const { loading, fetchBricks } = useBricks()
      const promise = fetchBricks()

      expect(loading.value).toBe(true)

      resolveFetch!([])
      await promise

      expect(loading.value).toBe(false)
    })

    it('sets error on failure', async () => {
      fetchMock.mockRejectedValue(new Error('fail'))

      const { error, fetchBricks } = useBricks()
      await fetchBricks()

      expect(error.value).toBe('Failed to load bricks')
    })
  })

  describe('createBrick', () => {
    it('POSTs and appends to array', async () => {
      const created = mockBrick('new')
      fetchMock.mockResolvedValue(created)

      const { bricks, createBrick } = useBricks()
      bricks.value = [mockBrick('1')]
      await createBrick({ title: 'New Brick' })

      expect(fetchMock).toHaveBeenCalledWith('/api/bricks', {
        method: 'POST',
        body: { title: 'New Brick' }
      })
      expect(bricks.value).toHaveLength(2)
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Validation error' } })

      const { error, createBrick } = useBricks()
      await expect(createBrick({ title: 'Bad' })).rejects.toBeTruthy()
      expect(error.value).toBe('Validation error')
    })
  })

  describe('updateBrick', () => {
    it('PUTs and replaces in array', async () => {
      const updated = { ...mockBrick('1'), title: 'Updated' }
      fetchMock.mockResolvedValue(updated)

      const { bricks, updateBrick } = useBricks()
      bricks.value = [mockBrick('1')]
      await updateBrick('1', { title: 'Updated' })

      expect(fetchMock).toHaveBeenCalledWith('/api/bricks/1', {
        method: 'PUT',
        body: { title: 'Updated' }
      })
      expect(bricks.value[0].title).toBe('Updated')
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue(new Error('Server error'))

      const { error, updateBrick } = useBricks()
      await expect(updateBrick('1', {})).rejects.toBeTruthy()
      expect(error.value).toBe('Server error')
    })
  })

  describe('deleteBrick', () => {
    it('DELETEs and removes from array', async () => {
      fetchMock.mockResolvedValue(undefined)

      const { bricks, deleteBrick } = useBricks()
      bricks.value = [mockBrick('1'), mockBrick('2')]
      await deleteBrick('1')

      expect(fetchMock).toHaveBeenCalledWith('/api/bricks/1', { method: 'DELETE' })
      expect(bricks.value).toHaveLength(1)
      expect(bricks.value[0].id).toBe('2')
    })

    it('throws on failure and sets error', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Not found' } })

      const { error, deleteBrick } = useBricks()
      await expect(deleteBrick('missing')).rejects.toBeTruthy()
      expect(error.value).toBe('Not found')
    })
  })

  describe('bricksByType', () => {
    it('groups bricks correctly', () => {
      const { bricks, bricksByType } = useBricks()
      bricks.value = [
        mockBrick('1', 'experience'),
        mockBrick('2', 'experience'),
        mockBrick('3', 'education')
      ]

      expect(bricksByType.value.experience).toHaveLength(2)
      expect(bricksByType.value.education).toHaveLength(1)
    })
  })

  describe('getBrickById', () => {
    it('returns matching brick', () => {
      const { bricks, getBrickById } = useBricks()
      bricks.value = [mockBrick('1'), mockBrick('2')]

      expect(getBrickById('1')?.id).toBe('1')
    })

    it('returns undefined for unknown id', () => {
      const { bricks, getBrickById } = useBricks()
      bricks.value = [mockBrick('1')]

      expect(getBrickById('unknown')).toBeUndefined()
    })
  })

  describe('error extraction (indirect via createBrick)', () => {
    it('extracts message from { data: { message } }', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Custom error' } })

      const { error, createBrick } = useBricks()
      await expect(createBrick({})).rejects.toBeTruthy()
      expect(error.value).toBe('Custom error')
    })

    it('falls back to Error.message', async () => {
      fetchMock.mockRejectedValue(new Error('Generic error'))

      const { error, createBrick } = useBricks()
      await expect(createBrick({})).rejects.toBeTruthy()
      expect(error.value).toBe('Generic error')
    })

    it('falls back to default message', async () => {
      fetchMock.mockRejectedValue({})

      const { error, createBrick } = useBricks()
      await expect(createBrick({})).rejects.toBeTruthy()
      expect(error.value).toBe('Failed to create brick')
    })
  })
})
