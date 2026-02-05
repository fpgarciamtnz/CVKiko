<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'

const props = defineProps<{
  bricks: Brick[]
}>()

const emit = defineEmits<{
  selectBricks: [ids: string[]]
}>()

const { analyzing, analysisResult, error, analyzeJobDescription, extractBrickIds } = useChat()

const jobDescription = ref('')
const hasAnalyzed = ref(false)

async function handleAnalyze() {
  if (!jobDescription.value.trim()) return

  hasAnalyzed.value = true
  await analyzeJobDescription(jobDescription.value, props.bricks)
}

function applySuggestions() {
  const ids = extractBrickIds(analysisResult.value)
  if (ids.length > 0) {
    emit('selectBricks', ids)
  }
}

const suggestedIds = computed(() => extractBrickIds(analysisResult.value))
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-4 border-b">
      <h3 class="font-semibold flex items-center gap-2">
        <UIcon
          name="i-lucide-bot"
          class="w-5 h-5 text-primary"
        />
        AI Assistant
      </h3>
      <p class="text-sm text-gray-500 mt-1">
        Paste a job description to get brick recommendations
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
          :disabled="analyzing"
        />
      </div>

      <UButton
        :loading="analyzing"
        :disabled="!jobDescription.trim()"
        block
        @click="handleAnalyze"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="w-4 h-4 mr-2"
        />
        Analyze & Suggest Bricks
      </UButton>

      <!-- Error -->
      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-alert-circle"
        class="mt-4"
        :title="error"
      />

      <!-- Analysis Result -->
      <div
        v-if="hasAnalyzed && !analyzing"
        class="mt-6"
      >
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">
            Analysis Results
          </h4>
          <UButton
            v-if="suggestedIds.length > 0"
            size="sm"
            variant="soft"
            @click="applySuggestions"
          >
            Apply Suggestions ({{ suggestedIds.length }})
          </UButton>
        </div>

        <div
          class="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        >
          <div class="whitespace-pre-wrap">
            {{ analysisResult }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="analyzing"
        class="mt-6"
      >
        <div class="flex items-center gap-2 text-gray-500">
          <UIcon
            name="i-lucide-loader-2"
            class="w-4 h-4 animate-spin"
          />
          <span>Analyzing job description...</span>
        </div>
        <div
          v-if="analysisResult"
          class="mt-4 prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
        >
          <div class="whitespace-pre-wrap">
            {{ analysisResult }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
