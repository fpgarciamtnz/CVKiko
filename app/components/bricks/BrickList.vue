<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { BrickType } from '~/utils/brick-types'
import { BRICK_TYPE_CONFIG } from '~/utils/brick-types'

const props = defineProps<{
  bricks: Brick[]
  type?: BrickType
  selectable?: boolean
  selectedIds?: Set<string>
}>()

const emit = defineEmits<{
  select: [brick: Brick]
  edit: [brick: Brick]
  delete: [brick: Brick]
}>()

const config = computed(() => props.type ? BRICK_TYPE_CONFIG[props.type] : null)
</script>

<template>
  <div class="space-y-4">
    <div v-if="config" class="flex items-center gap-2 mb-4">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        :class="`bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400`"
      >
        <UIcon :name="config.icon" class="w-4 h-4" />
      </div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ config.pluralLabel }}
      </h2>
      <UBadge :label="String(bricks.length)" variant="subtle" color="neutral" />
    </div>

    <div v-if="bricks.length === 0" class="text-center py-8 text-gray-500">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>No {{ config?.pluralLabel.toLowerCase() || 'bricks' }} yet</p>
    </div>

    <div v-else class="space-y-3">
      <BricksBrickCard
        v-for="brick in bricks"
        :key="brick.id"
        :brick="brick"
        :selectable="selectable"
        :selected="selectedIds?.has(brick.id)"
        @select="emit('select', brick)"
        @edit="emit('edit', brick)"
        @delete="emit('delete', brick)"
      />
    </div>
  </div>
</template>
