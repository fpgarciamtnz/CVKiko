<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type {
  BrickType,
  ExperienceData,
  EducationData,
  ProjectData,
  SkillData,
  PublicationData,
  CustomData
} from '~/utils/brick-types'
import { BRICK_TYPE_CONFIG, BRICK_TYPES } from '~/utils/brick-types'

const props = defineProps<{
  brick?: Brick
}>()

const emit = defineEmits<{
  submit: [data: Partial<Brick>]
  cancel: []
}>()

const isEditing = computed(() => !!props.brick)

// Form state
const selectedType = ref<BrickType>(props.brick?.type || 'experience')
const title = ref(props.brick?.title || '')
const tags = ref<string[]>(props.brick?.tags || [])

// Structured data for each type
const experienceData = ref<ExperienceData>(
  props.brick?.type === 'experience' && props.brick.structuredData
    ? (props.brick.structuredData as ExperienceData)
    : (BRICK_TYPE_CONFIG.experience.defaultData() as ExperienceData)
)

const educationData = ref<EducationData>(
  props.brick?.type === 'education' && props.brick.structuredData
    ? (props.brick.structuredData as EducationData)
    : (BRICK_TYPE_CONFIG.education.defaultData() as EducationData)
)

const projectData = ref<ProjectData>(
  props.brick?.type === 'project' && props.brick.structuredData
    ? (props.brick.structuredData as ProjectData)
    : (BRICK_TYPE_CONFIG.project.defaultData() as ProjectData)
)

const skillData = ref<SkillData>(
  props.brick?.type === 'skill' && props.brick.structuredData
    ? (props.brick.structuredData as SkillData)
    : (BRICK_TYPE_CONFIG.skill.defaultData() as SkillData)
)

const publicationData = ref<PublicationData>(
  props.brick?.type === 'publication' && props.brick.structuredData
    ? (props.brick.structuredData as PublicationData)
    : (BRICK_TYPE_CONFIG.publication.defaultData() as PublicationData)
)

const customData = ref<CustomData>(
  props.brick?.type === 'custom' && props.brick.structuredData
    ? (props.brick.structuredData as CustomData)
    : (BRICK_TYPE_CONFIG.custom.defaultData() as CustomData)
)

// Auto-generate title based on structured data
watch([selectedType, experienceData, educationData, projectData, skillData, publicationData], () => {
  if (!isEditing.value || !title.value) {
    switch (selectedType.value) {
      case 'experience':
        if (experienceData.value.jobTitle && experienceData.value.company) {
          title.value = `${experienceData.value.jobTitle} at ${experienceData.value.company}`
        }
        break
      case 'education':
        if (educationData.value.degree && educationData.value.institution) {
          title.value = `${educationData.value.degree} - ${educationData.value.institution}`
        }
        break
      case 'project':
        if (projectData.value.name) {
          title.value = projectData.value.name
        }
        break
      case 'skill':
        if (skillData.value.name) {
          title.value = skillData.value.name
        }
        break
      case 'publication':
        if (publicationData.value.title) {
          title.value = publicationData.value.title
        }
        break
    }
  }
}, { deep: true })

const currentConfig = computed(() => BRICK_TYPE_CONFIG[selectedType.value])

const typeOptions = BRICK_TYPES.map(type => ({
  label: BRICK_TYPE_CONFIG[type].label,
  value: type,
  icon: BRICK_TYPE_CONFIG[type].icon,
  description: BRICK_TYPE_CONFIG[type].description
}))

// Tags
const tagInput = ref('')

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    tagInput.value = ''
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter(t => t !== tag)
}

// Get current structured data based on type
function getCurrentStructuredData() {
  switch (selectedType.value) {
    case 'experience':
      return experienceData.value
    case 'education':
      return educationData.value
    case 'project':
      return projectData.value
    case 'skill':
      return skillData.value
    case 'publication':
      return publicationData.value
    case 'custom':
      return customData.value
  }
}

// Build frontmatter from structured data for backwards compatibility
function buildFrontmatter() {
  const data = getCurrentStructuredData()

  switch (selectedType.value) {
    case 'experience': {
      const exp = data as ExperienceData
      return {
        subtitle: exp.company,
        location: exp.location + (exp.locationType ? ` (${exp.locationType})` : ''),
        startDate: exp.startDate,
        endDate: exp.endDate,
        company: exp.company,
        role: exp.jobTitle
      }
    }
    case 'education': {
      const edu = data as EducationData
      return {
        subtitle: edu.field,
        location: edu.location,
        startDate: edu.graduationDate,
        endDate: edu.isExpected ? '' : edu.graduationDate
      }
    }
    case 'project': {
      const proj = data as ProjectData
      return {
        subtitle: proj.role,
        startDate: proj.date,
        url: proj.links[0]?.url || ''
      }
    }
    case 'skill': {
      const skill = data as SkillData
      return {
        subtitle: `${skill.proficiency} - ${skill.yearsOfExperience} years`
      }
    }
    case 'publication': {
      const pub = data as PublicationData
      return {
        subtitle: pub.publicationName,
        startDate: pub.date,
        url: pub.url || pub.doi
      }
    }
    default:
      return {}
  }
}

function handleSubmit() {
  emit('submit', {
    type: selectedType.value,
    title: title.value,
    tags: tags.value,
    frontmatter: buildFrontmatter(),
    structuredData: getCurrentStructuredData(),
    content: '' // Content generated from structuredData when needed
  })
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Type Selector (only for new bricks) -->
    <div v-if="!isEditing" class="space-y-3">
      <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        What type of brick do you want to create?
      </label>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          type="button"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all"
          :class="[
            selectedType === option.value
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
          ]"
          @click="selectedType = option.value"
        >
          <UIcon :name="option.icon" class="w-6 h-6" />
          <span class="font-medium">{{ option.label }}</span>
          <span class="text-xs text-neutral-500 text-center">{{ option.description }}</span>
        </button>
      </div>
    </div>

    <!-- Type indicator for editing -->
    <div v-else class="flex items-center gap-2 text-sm text-neutral-500">
      <UIcon :name="currentConfig.icon" class="w-4 h-4" />
      <span>Editing {{ currentConfig.label }}</span>
    </div>

    <USeparator />

    <!-- Type-specific form -->
    <div class="min-h-[300px]">
      <ExperienceForm v-if="selectedType === 'experience'" v-model="experienceData" />
      <EducationForm v-else-if="selectedType === 'education'" v-model="educationData" />
      <ProjectForm v-else-if="selectedType === 'project'" v-model="projectData" />
      <SkillForm v-else-if="selectedType === 'skill'" v-model="skillData" />
      <PublicationForm v-else-if="selectedType === 'publication'" v-model="publicationData" />
      <CustomForm v-else-if="selectedType === 'custom'" v-model="customData" />
    </div>

    <USeparator />

    <!-- Title (can be auto-generated or overridden) -->
    <UFormField label="Display Title" hint="Auto-generated, but you can customize">
      <UInput
        v-model="title"
        placeholder="Will be generated from your input"
        icon="i-lucide-type"
      />
    </UFormField>

    <!-- Tags -->
    <UFormField label="Tags" hint="For filtering and organizing your bricks">
      <div class="space-y-2">
        <div class="flex gap-2">
          <UInput
            v-model="tagInput"
            placeholder="Add a tag and press Enter"
            class="flex-1"
            @keydown.enter.prevent="addTag"
          />
          <UButton type="button" variant="soft" @click="addTag">
            Add
          </UButton>
        </div>
        <div v-if="tags.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in tags"
            :key="tag"
            :label="tag"
            variant="subtle"
            class="cursor-pointer"
            @click="removeTag(tag)"
          >
            <template #trailing>
              <UIcon name="i-lucide-x" class="w-3 h-3" />
            </template>
          </UBadge>
        </div>
      </div>
    </UFormField>

    <!-- Actions -->
    <div class="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <UButton type="button" variant="ghost" color="neutral" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit">
        <UIcon :name="isEditing ? 'i-lucide-save' : 'i-lucide-plus'" class="w-4 h-4" />
        {{ isEditing ? 'Update' : 'Create' }} Brick
      </UButton>
    </div>
  </form>
</template>
