<script setup lang="ts">
import type { EducationData } from '~/utils/brick-types'
import { DEGREE_OPTIONS } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: EducationData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: EducationData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// Input refs for tags
const courseworkInput = ref('')
const honorsInput = ref('')
const activityInput = ref('')

// Coursework management
function addCoursework() {
  const course = courseworkInput.value.trim()
  if (course && !data.value.coursework.includes(course)) {
    data.value = {
      ...data.value,
      coursework: [...data.value.coursework, course]
    }
    courseworkInput.value = ''
  }
}

function removeCoursework(course: string) {
  data.value = {
    ...data.value,
    coursework: data.value.coursework.filter(c => c !== course)
  }
}

// Honors management
function addHonor() {
  const honor = honorsInput.value.trim()
  if (honor && !data.value.honors.includes(honor)) {
    data.value = {
      ...data.value,
      honors: [...data.value.honors, honor]
    }
    honorsInput.value = ''
  }
}

function removeHonor(honor: string) {
  data.value = {
    ...data.value,
    honors: data.value.honors.filter(h => h !== honor)
  }
}

// Activities management
function addActivity() {
  const activity = activityInput.value.trim()
  if (activity && !data.value.activities.includes(activity)) {
    data.value = {
      ...data.value,
      activities: [...data.value.activities, activity]
    }
    activityInput.value = ''
  }
}

function removeActivity(activity: string) {
  data.value = {
    ...data.value,
    activities: data.value.activities.filter(a => a !== activity)
  }
}

const degreeOptions = DEGREE_OPTIONS.map(d => ({ label: d, value: d }))
</script>

<template>
  <div class="space-y-6">
    <!-- Degree & Field -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Degree"
        required
      >
        <UInputMenu
          v-model="data.degree"
          :items="degreeOptions"
          value-key="value"
          placeholder="Select or type degree"
          icon="i-lucide-graduation-cap"
        />
      </UFormField>

      <UFormField
        label="Field of Study"
        required
        hint="Major or concentration"
      >
        <UInput
          v-model="data.field"
          placeholder="e.g., Computer Science"
          icon="i-lucide-book-open"
        />
      </UFormField>
    </div>

    <!-- Institution & Location -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <UFormField label="Location">
        <UInput
          v-model="data.location"
          placeholder="e.g., Cambridge, MA"
          icon="i-lucide-map-pin"
        />
      </UFormField>
    </div>

    <!-- Graduation & GPA -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Graduation Date">
        <UInput
          v-model="data.graduationDate"
          placeholder="e.g., May 2024 or 2024-05"
          icon="i-lucide-calendar"
        />
      </UFormField>

      <UFormField
        label="GPA"
        hint="Only include if 3.5 or higher"
      >
        <UInput
          v-model="data.gpa"
          placeholder="e.g., 3.8/4.0"
          icon="i-lucide-trophy"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="data.isExpected"
      label="Expected graduation (still in progress)"
    />

    <!-- Honors -->
    <UFormField
      label="Honors & Awards"
      hint="Dean's List, Cum Laude, Scholarships, etc."
    >
      <div class="space-y-2">
        <div
          class="flex gap-2"
          @keydown.enter.prevent="addHonor"
        >
          <UInput
            v-model="honorsInput"
            placeholder="Type an honor and press Enter"
            class="flex-1"
          />
          <UButton
            variant="soft"
            @click="addHonor"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.honors.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="honor in data.honors"
            :key="honor"
            :label="honor"
            variant="subtle"
            color="warning"
            class="cursor-pointer"
            @click="removeHonor(honor)"
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

    <!-- Relevant Coursework -->
    <UFormField
      label="Relevant Coursework"
      hint="Classes relevant to your target job"
    >
      <div class="space-y-2">
        <div
          class="flex gap-2"
          @keydown.enter.prevent="addCoursework"
        >
          <UInput
            v-model="courseworkInput"
            placeholder="e.g., Data Structures, Machine Learning"
            class="flex-1"
          />
          <UButton
            variant="soft"
            @click="addCoursework"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.coursework.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="course in data.coursework"
            :key="course"
            :label="course"
            variant="subtle"
            color="primary"
            class="cursor-pointer"
            @click="removeCoursework(course)"
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

    <!-- Activities -->
    <UFormField
      label="Activities & Leadership"
      hint="Clubs, teams, leadership roles"
    >
      <div class="space-y-2">
        <div
          class="flex gap-2"
          @keydown.enter.prevent="addActivity"
        >
          <UInput
            v-model="activityInput"
            placeholder="e.g., President of Computer Science Club"
            class="flex-1"
          />
          <UButton
            variant="soft"
            @click="addActivity"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.activities.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="activity in data.activities"
            :key="activity"
            :label="activity"
            variant="subtle"
            color="success"
            class="cursor-pointer"
            @click="removeActivity(activity)"
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

    <!-- Thesis -->
    <UFormField
      label="Thesis/Capstone"
      hint="If applicable"
    >
      <UInput
        v-model="data.thesis"
        placeholder="e.g., Machine Learning Approaches to Natural Language Processing"
        icon="i-lucide-file-text"
      />
    </UFormField>
  </div>
</template>
