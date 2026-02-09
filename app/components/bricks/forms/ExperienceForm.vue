<script setup lang="ts">
import type { ExperienceData } from '~/utils/brick-types'

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

// Current position toggle
const isCurrentPosition = ref(!props.modelValue.endDate)

watch(isCurrentPosition, (isCurrent) => {
  if (isCurrent) {
    data.value = { ...data.value, endDate: '' }
  }
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

    <UFormField label="Location">
      <UInput
        v-model="data.location"
        placeholder="e.g., San Francisco, CA"
        icon="i-lucide-map-pin"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Start Date"
        required
      >
        <UInput
          v-model="data.startDate"
          placeholder="e.g., Jan 2020 or 2020-01"
          icon="i-lucide-calendar"
        />
      </UFormField>
      <UFormField label="End Date">
        <UInput
          v-model="data.endDate"
          placeholder="e.g., Dec 2023 or 2023-12"
          icon="i-lucide-calendar"
          :disabled="isCurrentPosition"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="isCurrentPosition"
      label="I currently work here"
    />

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
