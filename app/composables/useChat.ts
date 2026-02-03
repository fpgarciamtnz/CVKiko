import type { Brick } from './useBricks'

export function useChat() {
  const analyzing = ref(false)
  const analysisResult = ref<string>('')
  const error = ref<string | null>(null)

  async function analyzeJobDescription(jobDescription: string, bricks: Brick[]) {
    analyzing.value = true
    analysisResult.value = ''
    error.value = null

    try {
      const response = await $fetch<{ response: string }>('/api/chat/analyze', {
        method: 'POST',
        body: { jobDescription, bricks }
      })

      analysisResult.value = response.response
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Analysis failed'
      console.error('Chat analysis error:', e)
    } finally {
      analyzing.value = false
    }
  }

  function extractBrickIds(text: string): string[] {
    // Extract UUIDs from the analysis result
    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const matches = text.match(uuidPattern)
    return matches ? [...new Set(matches)] : []
  }

  function clearAnalysis() {
    analysisResult.value = ''
    error.value = null
  }

  return {
    analyzing,
    analysisResult,
    error,
    analyzeJobDescription,
    extractBrickIds,
    clearAnalysis
  }
}
