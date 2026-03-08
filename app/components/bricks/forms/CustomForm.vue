<script setup lang="ts">
import type { CustomData } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: CustomData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: CustomData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

watch(() => data.value.isCurrent, (isCurrent) => {
  if (isCurrent) {
    data.value = { ...data.value, endDate: '' }
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Start Date"
        hint="When this started"
      >
        <UInput
          v-model="data.startDate"
          type="month"
          icon="i-lucide-calendar"
        />
      </UFormField>

      <UFormField
        label="End Date"
        hint="Leave empty if still in progress"
      >
        <UInput
          v-model="data.endDate"
          type="month"
          icon="i-lucide-calendar"
          :disabled="data.isCurrent"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="data.isCurrent"
      label="This is still ongoing"
    />

    <UFormField
      label="Content (Markdown)"
      hint="Free-form content using Markdown syntax"
    >
      <UTextarea
        v-model="data.content"
        :rows="12"
        class="font-mono text-sm"
        placeholder="Write your custom content here using Markdown...

## Section Title

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text*

[Link text](https://example.com)"
      />
      <template #hint>
        <div class="text-xs text-neutral-500 mt-2">
          <span class="font-medium">Markdown tips:</span>
          <code class="mx-1">**bold**</code>
          <code class="mx-1">*italic*</code>
          <code class="mx-1">- bullet</code>
          <code class="mx-1">## heading</code>
          <code class="mx-1">[link](url)</code>
        </div>
      </template>
    </UFormField>
  </div>
</template>
