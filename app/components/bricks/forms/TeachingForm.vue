<script setup lang="ts">
import type { TeachingData } from '~/utils/brick-types'
import { TEACHING_STUDENT_LEVELS } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: TeachingData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: TeachingData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const isCurrentPosition = ref(!props.modelValue.endDate)

watch(isCurrentPosition, (isCurrent) => {
  if (isCurrent) {
    data.value = { ...data.value, endDate: '' }
  }
})

const studentLevelOptions = TEACHING_STUDENT_LEVELS.map(l => ({
  label: l.label,
  value: l.value
}))

function addResponsibility() {
  data.value = {
    ...data.value,
    responsibilities: [...data.value.responsibilities, '']
  }
}

function removeResponsibility(index: number) {
  data.value = {
    ...data.value,
    responsibilities: data.value.responsibilities.filter((_, i) => i !== index)
  }
}

function updateResponsibility(index: number, value: string) {
  const updated = [...data.value.responsibilities]
  updated[index] = value
  data.value = { ...data.value, responsibilities: updated }
}

const responsibilityRefs = ref<HTMLElement[]>([])

function handleResponsibilityEnter(index: number) {
  if (data.value.responsibilities[index]?.trim()) {
    addResponsibility()
    nextTick(() => {
      const inputs = responsibilityRefs.value
      const last = inputs[inputs.length - 1]
      last?.querySelector('input')?.focus()
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Role"
        required
        hint="e.g., Instructor, Teaching Assistant"
      >
        <UInput
          v-model="data.role"
          placeholder="e.g., Lecturer"
          icon="i-lucide-user"
        />
      </UFormField>

      <UFormField
        label="Institution"
        required
      >
        <UInput
          v-model="data.institution"
          placeholder="e.g., MIT"
          icon="i-lucide-building"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Course Name"
        required
      >
        <UInput
          v-model="data.courseName"
          placeholder="e.g., Introduction to Machine Learning"
        />
      </UFormField>

      <UFormField label="Course Code">
        <UInput
          v-model="data.courseCode"
          placeholder="e.g., CS 229"
        />
      </UFormField>
    </div>

    <UFormField label="Department">
      <UInput
        v-model="data.department"
        placeholder="e.g., Computer Science"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Start Date">
        <UInput
          v-model="data.startDate"
          placeholder="e.g., Sep 2022"
          icon="i-lucide-calendar"
        />
      </UFormField>
      <UFormField label="End Date">
        <UInput
          v-model="data.endDate"
          placeholder="e.g., Dec 2023"
          icon="i-lucide-calendar"
          :disabled="isCurrentPosition"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="isCurrentPosition"
      label="Currently in this role"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Student Level">
        <USelectMenu
          v-model="data.studentLevel"
          :items="studentLevelOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Enrollment Size">
        <UInputNumber
          v-model="data.enrollmentSize"
          :min="0"
          placeholder="0"
        />
      </UFormField>
    </div>

    <UFormField
      label="Responsibilities"
      hint="Describe your teaching duties"
    >
      <div class="space-y-2">
        <div
          v-for="(resp, index) in data.responsibilities"
          :key="index"
          :ref="(el: Element | ComponentPublicInstance | null) => { if (el) responsibilityRefs[index] = el as HTMLElement }"
          class="flex gap-2"
          @keydown.enter.prevent="handleResponsibilityEnter(index)"
        >
          <UInput
            :model-value="resp"
            placeholder="e.g., Designed and delivered lectures on deep learning"
            class="flex-1"
            @update:model-value="updateResponsibility(index, $event)"
          />
          <UButton
            v-if="data.responsibilities.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeResponsibility(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addResponsibility"
        >
          Add Responsibility
        </UButton>
      </div>
    </UFormField>
  </div>
</template>
