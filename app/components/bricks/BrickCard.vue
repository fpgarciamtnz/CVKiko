<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import { BRICK_TYPE_CONFIG, formatDateRange } from '~/utils/brick-types'

const props = defineProps<{
  brick: Brick
  selectable?: boolean
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [brick: Brick]
  edit: [brick: Brick]
  delete: [brick: Brick]
}>()

const config = computed(() => BRICK_TYPE_CONFIG[props.brick.type])
const dateRange = computed(() =>
  formatDateRange(props.brick.frontmatter?.startDate, props.brick.frontmatter?.endDate, props.brick.type)
)

// Get first paragraph of content as preview
const contentPreview = computed(() => {
  const content = props.brick.content || ''
  // Remove markdown headers and get first 150 chars
  const cleaned = content
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim()
  const firstParagraph = cleaned.split('\n\n')[0] || cleaned
  return firstParagraph.length > 150 ? firstParagraph.substring(0, 150) + '...' : firstParagraph
})
</script>

<template>
  <UCard
    :class="[
      'transition-all cursor-pointer hover:ring-2',
      selected ? 'ring-2 ring-primary' : 'hover:ring-gray-300 dark:hover:ring-gray-600'
    ]"
    @click="selectable && emit('select', brick)"
  >
    <div class="flex items-start gap-3">
      <div
        v-if="selectable"
        class="pt-0.5"
      >
        <UCheckbox
          :model-value="selected"
          @click.stop
        />
      </div>

      <div
        class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        :class="`bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400`"
      >
        <UIcon
          :name="config.icon"
          class="w-5 h-5"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ brick.title }}
            </h3>
            <p
              v-if="brick.frontmatter?.subtitle"
              class="text-sm text-gray-600 dark:text-gray-400"
            >
              {{ brick.frontmatter.subtitle }}
            </p>
          </div>
          <div
            v-if="!selectable"
            class="flex items-center gap-1"
          >
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              size="xs"
              color="neutral"
              @click.stop="emit('edit', brick)"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              size="xs"
              color="error"
              @click.stop="emit('delete', brick)"
            />
          </div>
        </div>

        <p
          v-if="dateRange"
          class="text-xs text-gray-500 dark:text-gray-500 mt-1"
        >
          {{ dateRange }}
          <span v-if="brick.frontmatter?.location"> · {{ brick.frontmatter.location }}</span>
        </p>

        <p
          v-if="contentPreview"
          class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2"
        >
          {{ contentPreview }}
        </p>

        <div
          v-if="brick.tags?.length"
          class="flex flex-wrap gap-1 mt-2"
        >
          <UBadge
            v-for="tag in brick.tags.slice(0, 5)"
            :key="tag"
            :label="tag"
            variant="subtle"
            size="xs"
          />
          <UBadge
            v-if="brick.tags.length > 5"
            :label="`+${brick.tags.length - 5}`"
            variant="subtle"
            size="xs"
            color="neutral"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
