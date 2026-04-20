import type { BrickType } from '~/utils/brick-types'

interface OptimizationAdjustment {
  brickId: string
  adjustedContent: string
  reasoning: string
  relevanceScore: number
}

interface OptimizationResult {
  sectionOrder: BrickType[]
  brickAdjustments: OptimizationAdjustment[]
  withinSectionOrder: Record<BrickType, string[]>
  overallTips: string[]
}

export function useOptimize() {
  const {
    sectionTypeOrder,
    selectedBricks,
    reorderSections,
    applyContentOverride,
    cvMode
  } = useCVBuilder()

  const optimizationResult = ref<OptimizationResult | null>(null)
  const isOptimizing = ref(false)
  const error = ref<Error | null>(null)
  const abortController = ref<AbortController | null>(null)

  async function optimize(jobDescription: string) {
    const bricksData = selectedBricks.value.map(b => ({
      id: b.id,
      type: b.type,
      title: b.title,
      content: b.content,
      tags: b.tags,
      frontmatter: b.frontmatter
    }))

    abortController.value?.abort()
    abortController.value = new AbortController()
    optimizationResult.value = null
    error.value = null
    isOptimizing.value = true

    try {
      const result = await $fetch<OptimizationResult>('/api/chat/optimize', {
        method: 'POST',
        body: {
          jobDescription,
          selectedBricks: bricksData,
          currentSectionOrder: sectionTypeOrder.value,
          cvMode: cvMode.value
        },
        signal: abortController.value.signal
      })
      optimizationResult.value = result
    } catch (e: unknown) {
      const err = e as { name?: string, data?: { message?: string }, message?: string }
      if (err.name !== 'AbortError') {
        error.value = new Error(err.data?.message || err.message || 'Optimization failed')
      }
    } finally {
      isOptimizing.value = false
      abortController.value = null
    }
  }

  function stop() {
    abortController.value?.abort()
    abortController.value = null
    isOptimizing.value = false
  }

  function acceptSectionOrder() {
    const result = optimizationResult.value
    if (!result?.sectionOrder) return
    reorderSections(result.sectionOrder.filter((s): s is BrickType => !!s))
  }

  function acceptBrickContent(brickId: string) {
    const result = optimizationResult.value
    if (!result?.brickAdjustments) return
    const adjustment = result.brickAdjustments.find(a => a?.brickId === brickId)
    if (adjustment?.adjustedContent) {
      applyContentOverride(brickId, adjustment.adjustedContent)
    }
  }

  function acceptAllChanges() {
    acceptSectionOrder()
    const result = optimizationResult.value
    if (result?.brickAdjustments) {
      for (const adj of result.brickAdjustments) {
        if (adj?.brickId && adj?.adjustedContent) {
          applyContentOverride(adj.brickId, adj.adjustedContent)
        }
      }
    }
  }

  return {
    optimizationResult,
    isOptimizing,
    error,
    optimize,
    stop,
    acceptSectionOrder,
    acceptBrickContent,
    acceptAllChanges
  }
}
