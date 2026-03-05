<script setup lang="ts">
import { BRICK_TYPE_CONFIG, type BrickType } from '~/utils/brick-types'

const { selectedBricks } = useCVBuilder()
const {
  optimizationResult,
  isOptimizing,
  error,
  optimize,
  stop,
  acceptSectionOrder,
  acceptBrickContent,
  acceptWithinSectionOrder,
  acceptAllChanges
} = useOptimize()

const jobDescription = ref('')
const hasOptimized = ref(false)

async function handleOptimize() {
  if (!jobDescription.value.trim() || selectedBricks.value.length === 0) return
  hasOptimized.value = true
  optimize(jobDescription.value)
}

function getBrickTitle(brickId: string | undefined): string {
  if (!brickId) return 'Unknown'
  return selectedBricks.value.find(b => b.id === brickId)?.title || brickId
}

function getSectionLabel(type: string | undefined): string {
  if (!type) return ''
  return BRICK_TYPE_CONFIG[type as BrickType]?.pluralLabel || type
}

function getScoreColor(score: number | undefined): string {
  if (score == null) return ''
  if (score >= 8) return 'text-green-600'
  if (score >= 5) return 'text-yellow-600'
  return 'text-red-500'
}

// Filter out undefined items from DeepPartial arrays
const validAdjustments = computed(() => {
  return (optimizationResult.value?.brickAdjustments || []).filter(
    (a): a is NonNullable<typeof a> => !!a?.brickId
  )
})

const validSectionOrder = computed(() => {
  return (optimizationResult.value?.sectionOrder || []).filter(
    (s): s is NonNullable<typeof s> => !!s
  )
})

const validTips = computed(() => {
  return (optimizationResult.value?.overallTips || []).filter(
    (t): t is string => !!t
  )
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b">
      <h3 class="font-semibold flex items-center gap-2">
        <UIcon
          name="i-lucide-wand-sparkles"
          class="w-5 h-5 text-primary"
        />
        CV Optimizer
      </h3>
      <p class="text-sm text-gray-500 mt-1">
        Optimize your CV content and order for a specific job
      </p>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Job Description Input -->
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Job Description</label>
        <UTextarea
          v-model="jobDescription"
          :rows="6"
          placeholder="Paste the job description here..."
          :disabled="isOptimizing"
        />
      </div>

      <div class="flex gap-2">
        <UButton
          :loading="isOptimizing"
          :disabled="!jobDescription.trim() || selectedBricks.length === 0"
          block
          class="flex-1"
          @click="handleOptimize"
        >
          <UIcon
            name="i-lucide-wand-sparkles"
            class="w-4 h-4 mr-2"
          />
          Optimize CV
        </UButton>
        <UButton
          v-if="isOptimizing"
          variant="ghost"
          color="neutral"
          @click="stop"
        >
          Stop
        </UButton>
      </div>

      <p
        v-if="selectedBricks.length === 0"
        class="text-xs text-gray-400 mt-2"
      >
        Select bricks first to optimize your CV
      </p>

      <!-- Error -->
      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-alert-circle"
        class="mt-4"
        :title="error.message || 'Optimization failed'"
      />

      <!-- Results -->
      <div
        v-if="hasOptimized && optimizationResult"
        class="mt-6 space-y-4"
      >
        <!-- Accept All -->
        <div class="flex justify-end">
          <UButton
            size="sm"
            :disabled="isOptimizing"
            @click="acceptAllChanges"
          >
            Accept All Changes
          </UButton>
        </div>

        <!-- Section Order -->
        <div
          v-if="validSectionOrder.length > 0"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-sm">
              Recommended Section Order
            </h4>
            <UButton
              size="xs"
              variant="soft"
              :disabled="isOptimizing"
              @click="acceptSectionOrder(); acceptWithinSectionOrder()"
            >
              Apply Order
            </UButton>
          </div>
          <ol class="text-sm space-y-1">
            <li
              v-for="(type, idx) in validSectionOrder"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="text-gray-400 text-xs w-4">{{ idx + 1 }}.</span>
              <span>{{ getSectionLabel(type) }}</span>
            </li>
          </ol>
        </div>

        <!-- Brick Adjustments -->
        <div
          v-if="validAdjustments.length > 0"
          class="space-y-3"
        >
          <h4 class="font-medium text-sm">
            Content Adjustments
          </h4>
          <div
            v-for="adj in validAdjustments"
            :key="adj.brickId"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex-1">
                <span class="font-medium text-sm">{{ getBrickTitle(adj.brickId) }}</span>
                <span
                  v-if="adj.relevanceScore != null"
                  class="ml-2 text-xs font-mono"
                  :class="getScoreColor(adj.relevanceScore)"
                >
                  {{ adj.relevanceScore }}/10
                </span>
              </div>
              <UButton
                size="xs"
                variant="soft"
                :disabled="isOptimizing"
                @click="acceptBrickContent(adj.brickId!)"
              >
                Accept
              </UButton>
            </div>
            <p
              v-if="adj.reasoning"
              class="text-xs text-gray-500 mb-2"
            >
              {{ adj.reasoning }}
            </p>
            <div
              v-if="adj.adjustedContent"
              class="text-sm bg-white dark:bg-gray-900 rounded p-2 border border-green-200 dark:border-green-800"
            >
              <p class="whitespace-pre-wrap">
                {{ adj.adjustedContent }}
              </p>
            </div>
          </div>
        </div>

        <!-- Overall Tips -->
        <div
          v-if="validTips.length > 0"
          class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
        >
          <h4 class="font-medium text-sm mb-2">
            Tips
          </h4>
          <ul class="text-sm space-y-1">
            <li
              v-for="(tip, idx) in validTips"
              :key="idx"
              class="flex gap-2"
            >
              <span class="text-blue-500 shrink-0">-</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isOptimizing && !optimizationResult"
        class="mt-6"
      >
        <div class="flex items-center gap-2 text-gray-500">
          <UIcon
            name="i-lucide-loader-2"
            class="w-4 h-4 animate-spin"
          />
          <span>Optimizing your CV...</span>
        </div>
      </div>
    </div>
  </div>
</template>
