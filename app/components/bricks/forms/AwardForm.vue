<script setup lang="ts">
import type { AwardData } from '~/utils/brick-types'
import { AWARD_CATEGORIES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: AwardData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: AwardData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const categoryOptions = AWARD_CATEGORIES.map(c => ({
  label: c.label,
  value: c.value
}))
</script>

<template>
  <div class="space-y-6">
    <UFormField
      label="Award Name"
      required
    >
      <UInput
        v-model="data.name"
        placeholder="e.g., Best Paper Award"
        icon="i-lucide-trophy"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Organization">
        <UInput
          v-model="data.organization"
          placeholder="e.g., ACM, IEEE"
          icon="i-lucide-building"
        />
      </UFormField>

      <UFormField label="Category">
        <USelectMenu
          v-model="data.category"
          :items="categoryOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Date">
        <UInput
          v-model="data.date"
          placeholder="e.g., Jun 2024"
          icon="i-lucide-calendar"
        />
      </UFormField>

      <UFormField label="Amount/Value">
        <UInput
          v-model="data.amount"
          placeholder="e.g., $5,000"
          icon="i-lucide-banknote"
        />
      </UFormField>
    </div>

    <UFormField
      label="Description"
      hint="Brief description of the award"
    >
      <UTextarea
        v-model="data.description"
        :rows="3"
        placeholder="What was the award for?"
      />
    </UFormField>
  </div>
</template>
