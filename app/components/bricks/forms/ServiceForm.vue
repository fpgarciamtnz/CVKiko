<script setup lang="ts">
import type { ServiceData } from '~/utils/brick-types'
import { SERVICE_TYPES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: ServiceData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: ServiceData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const isCurrentRole = ref(!props.modelValue.endDate)

watch(isCurrentRole, (isCurrent) => {
  if (isCurrent) {
    data.value = { ...data.value, endDate: '' }
  }
})

const serviceTypeOptions = SERVICE_TYPES.map(st => ({
  label: st.label,
  value: st.value
}))
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Role"
        required
      >
        <UInput
          v-model="data.role"
          placeholder="e.g., Associate Editor, Program Committee Member"
          icon="i-lucide-user"
        />
      </UFormField>

      <UFormField label="Service Type">
        <USelectMenu
          v-model="data.serviceType"
          :items="serviceTypeOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <UFormField
      label="Organization"
      required
    >
      <UInput
        v-model="data.organization"
        placeholder="e.g., IEEE Transactions on AI, ACM SIGCHI"
        icon="i-lucide-building"
      />
    </UFormField>

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
          placeholder="e.g., Present"
          icon="i-lucide-calendar"
          :disabled="isCurrentRole"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="isCurrentRole"
      label="Currently in this role"
    />

    <UFormField
      label="Description"
      hint="Describe your service activities"
    >
      <UTextarea
        v-model="data.description"
        :rows="4"
        placeholder="Describe your responsibilities and contributions..."
      />
    </UFormField>
  </div>
</template>
