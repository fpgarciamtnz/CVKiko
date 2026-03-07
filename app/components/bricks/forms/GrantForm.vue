<script setup lang="ts">
import type { GrantData } from '~/utils/brick-types'
import { GRANT_ROLES, GRANT_STATUSES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: GrantData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: GrantData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const roleOptions = GRANT_ROLES.map(r => ({
  label: r.label,
  value: r.value
}))

const statusOptions = GRANT_STATUSES.map(s => ({
  label: s.label,
  value: s.value
}))
</script>

<template>
  <div class="space-y-6">
    <UFormField
      label="Grant Title"
      required
    >
      <UInput
        v-model="data.title"
        placeholder="e.g., Neural Approaches to Language Understanding"
        icon="i-lucide-file-text"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Funding Agency"
        required
      >
        <UInput
          v-model="data.fundingAgency"
          placeholder="e.g., NSF, NIH, DOE"
          icon="i-lucide-building"
        />
      </UFormField>

      <UFormField label="Your Role">
        <USelectMenu
          v-model="data.role"
          :items="roleOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Amount">
        <UInput
          v-model="data.amount"
          placeholder="e.g., $500,000"
          icon="i-lucide-banknote"
        />
      </UFormField>

      <UFormField label="Status">
        <USelectMenu
          v-model="data.status"
          :items="statusOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Start Date">
        <UInput
          v-model="data.startDate"
          placeholder="e.g., Jan 2023"
          icon="i-lucide-calendar"
        />
      </UFormField>
      <UFormField label="End Date">
        <UInput
          v-model="data.endDate"
          placeholder="e.g., Dec 2025"
          icon="i-lucide-calendar"
        />
      </UFormField>
    </div>

    <UFormField label="Grant Number">
      <UInput
        v-model="data.grantNumber"
        placeholder="e.g., NSF-2345678"
      />
    </UFormField>

    <UFormField
      label="Description"
      hint="Brief description of the funded research"
    >
      <UTextarea
        v-model="data.description"
        :rows="4"
        placeholder="Describe the research project and objectives..."
      />
    </UFormField>
  </div>
</template>
