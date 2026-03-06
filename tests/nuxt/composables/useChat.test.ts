import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock $fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('$fetch', fetchMock)

describe('useChat', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  describe('extractBrickIds', () => {
    it('extracts UUIDs from text', () => {
      const { extractBrickIds } = useChat()
      const text = 'Use brick 550e8400-e29b-41d4-a716-446655440000 and brick 6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      const ids = extractBrickIds(text)
      expect(ids).toEqual([
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ])
    })

    it('returns empty array when no UUIDs found', () => {
      const { extractBrickIds } = useChat()
      expect(extractBrickIds('no uuids here')).toEqual([])
    })

    it('deduplicates UUIDs', () => {
      const { extractBrickIds } = useChat()
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const text = `${uuid} ${uuid}`
      expect(extractBrickIds(text)).toHaveLength(1)
    })

    it('matches mixed case UUIDs', () => {
      const { extractBrickIds } = useChat()
      const text = '550E8400-E29B-41D4-A716-446655440000'
      expect(extractBrickIds(text)).toHaveLength(1)
    })
  })

  describe('clearAnalysis', () => {
    it('resets result and error', () => {
      const { analysisResult, error, clearAnalysis } = useChat()
      analysisResult.value = 'some result'
      error.value = 'some error'

      clearAnalysis()

      expect(analysisResult.value).toBe('')
      expect(error.value).toBeNull()
    })
  })

  describe('analyzeJobDescription', () => {
    it('calls $fetch with correct args', async () => {
      fetchMock.mockResolvedValue({ response: 'analysis result' })

      const { analyzeJobDescription } = useChat()
      await analyzeJobDescription('Frontend dev', [])

      expect(fetchMock).toHaveBeenCalledWith('/api/chat/analyze', {
        method: 'POST',
        body: { jobDescription: 'Frontend dev', bricks: [] }
      })
    })

    it('sets analysisResult on success', async () => {
      fetchMock.mockResolvedValue({ response: 'Great match!' })

      const { analysisResult, analyzeJobDescription } = useChat()
      await analyzeJobDescription('job desc', [])

      expect(analysisResult.value).toBe('Great match!')
    })

    it('analyzing is true during call, false after', async () => {
      let resolveFetch: (v: unknown) => void
      fetchMock.mockImplementation(() => new Promise((resolve) => {
        resolveFetch = resolve
      }))

      const { analyzing, analyzeJobDescription } = useChat()
      const promise = analyzeJobDescription('job desc', [])

      expect(analyzing.value).toBe(true)

      resolveFetch!({ response: 'done' })
      await promise

      expect(analyzing.value).toBe(false)
    })

    it('sets error from { data: { message } }', async () => {
      fetchMock.mockRejectedValue({ data: { message: 'Rate limited' } })

      const { error, analyzeJobDescription } = useChat()
      await analyzeJobDescription('job desc', [])

      expect(error.value).toBe('Rate limited')
    })

    it('falls back to Error.message', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'))

      const { error, analyzeJobDescription } = useChat()
      await analyzeJobDescription('job desc', [])

      expect(error.value).toBe('Network error')
    })

    it('ultimate fallback to "Analysis failed"', async () => {
      fetchMock.mockRejectedValue({})

      const { error, analyzeJobDescription } = useChat()
      await analyzeJobDescription('job desc', [])

      expect(error.value).toBe('Analysis failed')
    })
  })
})
