<script setup lang="ts">
import type { SkillData } from '~/utils/brick-types'
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: SkillData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: SkillData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// Related projects input
const projectInput = ref('')

function addProject() {
  const project = projectInput.value.trim()
  if (project && !data.value.relatedProjects.includes(project)) {
    data.value = {
      ...data.value,
      relatedProjects: [...data.value.relatedProjects, project]
    }
    projectInput.value = ''
  }
}

function removeProject(project: string) {
  data.value = {
    ...data.value,
    relatedProjects: data.value.relatedProjects.filter(p => p !== project)
  }
}

const categoryOptions = SKILL_CATEGORIES.map(c => ({
  label: c.label,
  value: c.value,
  description: c.description
}))

const proficiencyOptions = PROFICIENCY_LEVELS.map(p => ({
  label: p.label,
  value: p.value,
  description: p.description
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Skill Name -->
    <UFormField
      label="Skill Name"
      required
    >
      <UInput
        v-model="data.name"
        placeholder="e.g., TypeScript, Project Management, Spanish"
        icon="i-lucide-wrench"
      />
    </UFormField>

    <!-- Category & Proficiency -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Category"
        required
      >
        <URadioGroup
          v-model="data.category"
          :items="categoryOptions"
        />
      </UFormField>

      <UFormField
        label="Proficiency Level"
        required
      >
        <URadioGroup
          v-model="data.proficiency"
          :items="proficiencyOptions"
        />
      </UFormField>
    </div>

    <!-- Years of Experience -->
    <UFormField
      label="Years of Experience"
      hint="How many years have you used this skill?"
    >
      <UInput
        v-model.number="data.yearsOfExperience"
        type="number"
        :min="0"
        :max="50"
        placeholder="e.g., 5"
        icon="i-lucide-clock"
      />
    </UFormField>

    <!-- Context -->
    <UFormField
      label="Context"
      hint="Briefly describe where/how you've used this skill"
    >
      <UTextarea
        v-model="data.context"
        :rows="3"
        placeholder="e.g., Used TypeScript daily for 3 years building enterprise web applications at Google. Migrated legacy JavaScript codebase to TypeScript, improving code quality and reducing bugs by 30%."
      />
    </UFormField>

    <!-- Related Projects -->
    <UFormField
      label="Related Projects"
      hint="Projects where you applied this skill"
    >
      <div class="space-y-2">
        <div class="flex gap-2">
          <UInput
            v-model="projectInput"
            placeholder="Project name"
            class="flex-1"
            @keydown.enter.prevent="addProject"
          />
          <UButton
            variant="soft"
            @click="addProject"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.relatedProjects.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="project in data.relatedProjects"
            :key="project"
            :label="project"
            variant="subtle"
            color="success"
            class="cursor-pointer"
            @click="removeProject(project)"
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
