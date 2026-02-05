<script setup lang="ts">
import type { ProjectData } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: ProjectData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: ProjectData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// Features management
function addFeature() {
  data.value = {
    ...data.value,
    features: [...data.value.features, '']
  }
}

function removeFeature(index: number) {
  data.value = {
    ...data.value,
    features: data.value.features.filter((_, i) => i !== index)
  }
}

function updateFeature(index: number, value: string) {
  const updated = [...data.value.features]
  updated[index] = value
  data.value = { ...data.value, features: updated }
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

// Links management
function addLink() {
  data.value = {
    ...data.value,
    links: [...data.value.links, { label: '', url: '' }]
  }
}

function removeLink(index: number) {
  data.value = {
    ...data.value,
    links: data.value.links.filter((_, i) => i !== index)
  }
}

function updateLink(index: number, field: 'label' | 'url', value: string) {
  const updated = [...data.value.links]
  updated[index] = { ...updated[index], [field]: value }
  data.value = { ...data.value, links: updated }
}

const projectTypeOptions = [
  { label: 'Personal Project', value: true },
  { label: 'Professional/Work Project', value: false }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Project Name"
        required
      >
        <UInput
          v-model="data.name"
          placeholder="e.g., E-commerce Platform"
          icon="i-lucide-folder"
        />
      </UFormField>

      <UFormField label="Your Role">
        <UInput
          v-model="data.role"
          placeholder="e.g., Lead Developer, Solo Project"
          icon="i-lucide-user"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Project Type">
        <URadioGroup
          v-model="data.isPersonal"
          :items="projectTypeOptions"
          orientation="horizontal"
        />
      </UFormField>

      <UFormField
        label="Date"
        hint="When was this built?"
      >
        <UInput
          v-model="data.date"
          type="month"
        />
      </UFormField>
    </div>

    <!-- Description -->
    <UFormField
      label="Short Description"
      required
      hint="1-2 sentences explaining what the project does"
    >
      <UTextarea
        v-model="data.description"
        :rows="2"
        placeholder="e.g., A full-stack e-commerce platform that enables small businesses to sell products online with integrated payment processing."
      />
    </UFormField>

    <!-- Problem Solved -->
    <UFormField
      label="Problem Solved"
      hint="What problem does this project solve?"
    >
      <UTextarea
        v-model="data.problem"
        :rows="2"
        placeholder="e.g., Small businesses struggled with expensive e-commerce solutions. This platform provides an affordable, easy-to-use alternative."
      />
    </UFormField>

    <!-- Key Features -->
    <UFormField
      label="Key Features"
      hint="2-4 main features of your project"
    >
      <div class="space-y-2">
        <div
          v-for="(feature, index) in data.features"
          :key="index"
          class="flex gap-2"
        >
          <UInput
            :model-value="feature"
            placeholder="e.g., Real-time inventory management with automatic reordering"
            class="flex-1"
            @update:model-value="updateFeature(index, $event)"
          />
          <UButton
            v-if="data.features.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeFeature(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addFeature"
        >
          Add Feature
        </UButton>
      </div>
    </UFormField>

    <!-- Technologies -->
    <UFormField
      label="Tech Stack"
      hint="Technologies, languages, frameworks used"
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

    <!-- Outcome -->
    <UFormField
      label="Outcome / Results"
      hint="Impact, metrics, or results"
    >
      <UTextarea
        v-model="data.outcome"
        :rows="2"
        placeholder="e.g., Used by 50+ small businesses, processing $100K+ in transactions monthly"
      />
    </UFormField>

    <!-- Links -->
    <UFormField
      label="Links"
      hint="GitHub, Demo, Documentation, etc."
    >
      <div class="space-y-2">
        <div
          v-for="(link, index) in data.links"
          :key="index"
          class="flex gap-2"
        >
          <UInput
            :model-value="link.label"
            placeholder="Label (e.g., GitHub)"
            class="w-32"
            @update:model-value="updateLink(index, 'label', $event)"
          />
          <UInput
            :model-value="link.url"
            placeholder="https://..."
            class="flex-1"
            type="url"
            @update:model-value="updateLink(index, 'url', $event)"
          />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeLink(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addLink"
        >
          Add Link
        </UButton>
      </div>
    </UFormField>
  </div>
</template>
