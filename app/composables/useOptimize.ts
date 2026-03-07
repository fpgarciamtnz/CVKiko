import { experimental_useObject as useObject } from '@ai-sdk/vue'
import { z } from 'zod'
import type { BrickType } from '~/utils/brick-types'

const BrickTypeEnum = z.enum(['experience', 'education', 'project', 'skill', 'publication', 'custom', 'teaching', 'grant', 'presentation', 'award', 'service'])

const OptimizationResultSchema = z.object({
  sectionOrder: z.array(BrickTypeEnum),
  brickAdjustments: z.array(z.object({
    brickId: z.string(),
    adjustedContent: z.string(),
    reasoning: z.string(),
    relevanceScore: z.number()
  })),
  withinSectionOrder: z.record(BrickTypeEnum, z.array(z.string())),
  overallTips: z.array(z.string())
})

export function useOptimize() {
  const {
    sectionTypeOrder,
    selectedBricks,
    reorderSections,
    reorderBricks,
    applyContentOverride,
    brickOrder,
    cvMode
  } = useCVBuilder()

  const { object, submit, isLoading, error, stop } = useObject({
    api: '/api/chat/optimize',
    schema: OptimizationResultSchema
  })

  function optimize(jobDescription: string) {
    const bricksData = selectedBricks.value.map(b => ({
      id: b.id,
      type: b.type,
      title: b.title,
      content: b.content,
      tags: b.tags,
      frontmatter: b.frontmatter
    }))

    submit({
      jobDescription,
      selectedBricks: bricksData,
      currentSectionOrder: sectionTypeOrder.value,
      cvMode: cvMode.value
    })
  }

  function acceptSectionOrder() {
    const result = object.value
    if (!result?.sectionOrder) return
    reorderSections(result.sectionOrder.filter((s): s is BrickType => !!s))
  }

  function acceptBrickContent(brickId: string) {
    const result = object.value
    if (!result?.brickAdjustments) return
    const adjustment = result.brickAdjustments.find(a => a?.brickId === brickId)
    if (adjustment?.adjustedContent) {
      applyContentOverride(brickId, adjustment.adjustedContent)
    }
  }

  function acceptWithinSectionOrder() {
    const result = object.value
    if (!result?.withinSectionOrder) return

    const sectionOrder = result.sectionOrder?.filter((s): s is BrickType => !!s) || sectionTypeOrder.value
    const newOrder: string[] = []
    for (const type of sectionOrder) {
      const sectionBrickIds = result.withinSectionOrder[type]
      if (sectionBrickIds) {
        const selectedIds = new Set(brickOrder.value)
        for (const id of sectionBrickIds) {
          if (id && selectedIds.has(id)) {
            newOrder.push(id)
          }
        }
      }
      const remaining = selectedBricks.value
        .filter(b => b.type === type && !newOrder.includes(b.id))
      for (const b of remaining) {
        newOrder.push(b.id)
      }
    }
    reorderBricks(newOrder)
  }

  function acceptAllChanges() {
    acceptSectionOrder()
    acceptWithinSectionOrder()
    const result = object.value
    if (result?.brickAdjustments) {
      for (const adj of result.brickAdjustments) {
        if (adj?.brickId && adj?.adjustedContent) {
          applyContentOverride(adj.brickId, adj.adjustedContent)
        }
      }
    }
  }

  return {
    optimizationResult: object,
    isOptimizing: isLoading,
    error,
    optimize,
    stop,
    acceptSectionOrder,
    acceptBrickContent,
    acceptWithinSectionOrder,
    acceptAllChanges
  }
}
