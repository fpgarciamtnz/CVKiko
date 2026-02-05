<script setup lang="ts">
import type { ExperienceData } from '~/utils/brick-types'
import { LOCATION_TYPES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: ExperienceData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: ExperienceData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// Dynamic list management
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

function addAchievement() {
  data.value = {
    ...data.value,
    achievements: [...data.value.achievements, '']
  }
}

function removeAchievement(index: number) {
  data.value = {
    ...data.value,
    achievements: data.value.achievements.filter((_, i) => i !== index)
  }
}

function updateAchievement(index: number, value: string) {
  const updated = [...data.value.achievements]
  updated[index] = value
  data.value = { ...data.value, achievements: updated }
}

// Tech tags
const techInput = ref('')
function addTech() {
  const tech = techInput.value.trim()
  if (tech && !data.value.technologies.includes(tech)) {
    data.value = {
      ...data.value,
      technologies: [...data.value.technologies, tech]
    }
    techInput.value = ''
  }
}

function removeTech(tech: string) {
  data.value = {
    ...data.value,
    technologies: data.value.technologies.filter(t => t !== tech)
  }
}

const locationTypeOptions = LOCATION_TYPES.map(lt => ({
  label: lt.label,
  value: lt.value
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Job Title"
        required
        hint="Your role at this company"
      >
        <UInput
          v-model="data.jobTitle"
          placeholder="e.g., Senior Software Engineer"
          icon="i-lucide-user"
        />
      </UFormField>

      <UFormField
        label="Company"
        required
      >
        <UInput
          v-model="data.company"
          placeholder="e.g., Google"
          icon="i-lucide-building"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UFormField label="Location">
        <UInput
          v-model="data.location"
          placeholder="e.g., San Francisco, CA"
          icon="i-lucide-map-pin"
        />
      </UFormField>

      <UFormField label="Work Type">
        <USelectMenu
          v-model="data.locationType"
          :items="locationTypeOptions"
          value-key="value"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-2">
        <UFormField
          label="Start Date"
          required
        >
          <UInput
            v-model="data.startDate"
            type="month"
          />
        </UFormField>
        <UFormField
          label="End Date"
          hint="Empty = current"
        >
          <UInput
            v-model="data.endDate"
            type="month"
          />
        </UFormField>
      </div>
    </div>

    <!-- Responsibilities -->
    <UFormField
      label="Responsibilities"
      hint="What were your main duties? Use action verbs (Led, Developed, Managed...)"
    >
      <div class="space-y-2">
        <div
          v-for="(resp, index) in data.responsibilities"
          :key="index"
          class="flex gap-2"
        >
          <UInput
            :model-value="resp"
            placeholder="e.g., Led development of payment processing system serving 1M+ users"
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

    <!-- Achievements -->
    <UFormField
      label="Achievements"
      hint="Quantify your impact! Use metrics (%, $, numbers)"
    >
      <div class="space-y-2">
        <div
          v-for="(ach, index) in data.achievements"
          :key="index"
          class="flex gap-2"
        >
          <UInput
            :model-value="ach"
            placeholder="e.g., Increased system performance by 40%, saving $200K annually"
            class="flex-1"
            @update:model-value="updateAchievement(index, $event)"
          />
          <UButton
            v-if="data.achievements.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeAchievement(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addAchievement"
        >
          Add Achievement
        </UButton>
      </div>
    </UFormField>

    <!-- Technologies -->
    <UFormField
      label="Technologies Used"
      hint="Tools, languages, and frameworks you used"
    >
      <div class="space-y-2">
        <div class="flex gap-2">
          <UInput
            v-model="techInput"
            placeholder="Type a technology and press Enter"
            class="flex-1"
            @keydown.enter.prevent="addTech"
          />
          <UButton
            variant="soft"
            @click="addTech"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.technologies.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="tech in data.technologies"
            :key="tech"
            :label="tech"
            variant="subtle"
            color="primary"
            class="cursor-pointer"
            @click="removeTech(tech)"
          >
            <template #trailing>
              <UIcon
                name="i-lucide-x"
                class="w-3 h-3"
              />
            </template>
          </UBadge>
        </div>
      </div>
    </UFormField>
  </div>
</template>
