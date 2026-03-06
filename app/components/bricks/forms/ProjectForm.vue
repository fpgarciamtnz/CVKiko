<script setup lang="ts">
import type { ProjectData } from '~/utils/brick-types'
import { parseGitHubUrl } from '~/utils/brick-types'

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

// GitHub Lookup state
const githubInput = ref('')
const isLookingUp = ref(false)
const lookupError = ref('')
const lookupSuccess = ref(false)
const autoFilledFields = ref(new Set<string>())

const isValidGitHubUrl = computed(() => !!parseGitHubUrl(githubInput.value))

async function lookupGitHub() {
  const raw = githubInput.value.trim()
  if (!raw || !isValidGitHubUrl.value) return

  isLookingUp.value = true
  lookupError.value = ''
  lookupSuccess.value = false

  try {
    const result = await $fetch('/api/projects/lookup-github', {
      method: 'POST',
      body: { url: raw },
    })

    if (!result.found || !result.data) {
      lookupError.value = result.error || 'Repository not found'
      return
    }

    const filled = new Set<string>()
    const incoming = result.data

    const updates: Partial<ProjectData> = {}

    if (incoming.name) { updates.name = incoming.name; filled.add('name') }
    if (incoming.role) { updates.role = incoming.role; filled.add('role') }
    if (incoming.description) { updates.description = incoming.description; filled.add('description') }
    if (incoming.problem) { updates.problem = incoming.problem; filled.add('problem') }
    if (incoming.features?.length) { updates.features = incoming.features; filled.add('features') }
    if (incoming.technologies?.length) { updates.technologies = incoming.technologies; filled.add('technologies') }
    if (incoming.outcome) { updates.outcome = incoming.outcome; filled.add('outcome') }
    if (incoming.links?.length) { updates.links = incoming.links; filled.add('links') }
    if (incoming.isPersonal !== undefined) { updates.isPersonal = incoming.isPersonal; filled.add('isPersonal') }
    if (incoming.date) { updates.date = incoming.date; filled.add('date') }

    data.value = { ...data.value, ...updates }
    autoFilledFields.value = filled
    lookupSuccess.value = true
  }
  catch {
    lookupError.value = 'Failed to look up GitHub repository. Please try again.'
  }
  finally {
    isLookingUp.value = false
  }
}

function autoFillHint(field: string): string | undefined {
  return autoFilledFields.value.has(field) ? 'Auto-filled from GitHub' : undefined
}

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

// Ref for auto-focus on Enter
const featureRefs = ref<HTMLElement[]>([])

function handleFeatureEnter(index: number) {
  if (data.value.features[index]?.trim()) {
    addFeature()
    nextTick(() => {
      const inputs = featureRefs.value
      const last = inputs[inputs.length - 1]
      last?.querySelector('input')?.focus()
    })
  }
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
  const currentLink = updated[index] ?? { label: '', url: '' }
  updated[index] = { label: currentLink.label, url: currentLink.url, [field]: value }
  data.value = { ...data.value, links: updated }
}

const projectTypeOptions = [
  { label: 'Personal Project', value: true },
  { label: 'Professional/Work Project', value: false }
]
</script>

<template>
  <div class="space-y-6">
    <!-- GitHub Lookup Section -->
    <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-4 space-y-3">
      <div class="flex items-center gap-2 text-sm font-medium text-[var(--ui-text-highlighted)]">
        <UIcon name="i-simple-icons-github" />
        Auto-fill from GitHub
      </div>
      <div class="flex gap-2">
        <UInput
          v-model="githubInput"
          placeholder="e.g., https://github.com/owner/repo"
          icon="i-lucide-link"
          class="flex-1"
          @keydown.enter.prevent="lookupGitHub"
        />
        <UButton
          :loading="isLookingUp"
          :disabled="!githubInput.trim() || !isValidGitHubUrl"
          icon="i-lucide-sparkles"
          @click="lookupGitHub"
        >
          Fill from GitHub
        </UButton>
      </div>
      <UAlert
        v-if="lookupError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-x"
        :title="lookupError"
      />
      <UAlert
        v-if="lookupSuccess"
        color="success"
        variant="subtle"
        icon="i-lucide-circle-check"
        title="Project data loaded from GitHub! Review the auto-filled fields below."
      />
    </div>

    <USeparator label="Project Details" />

    <!-- Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Project Name"
        required
        :hint="autoFillHint('name')"
      >
        <UInput
          v-model="data.name"
          placeholder="e.g., E-commerce Platform"
          icon="i-lucide-folder"
        />
      </UFormField>

      <UFormField label="Your Role" :hint="autoFillHint('role')">
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
        :hint="autoFillHint('date') || 'When was this built?'"
      >
        <UInput
          v-model="data.date"
          type="month"
        />
      </UFormField>
    </div>

    <!-- Description -->
    <UFormField
      label="Project Description"
      required
      :hint="autoFillHint('description') || 'Describe what the project does and its purpose'"
    >
      <UTextarea
        v-model="data.description"
        :rows="4"
        placeholder="e.g., A full-stack e-commerce platform that enables small businesses to sell products online with integrated payment processing. Features include inventory management, order tracking, and analytics dashboard."
      />
    </UFormField>

    <!-- Problem Solved -->
    <UFormField
      label="Problem Solved"
      :hint="autoFillHint('problem') || 'What problem does this project solve? Why did you build it?'"
    >
      <UTextarea
        v-model="data.problem"
        :rows="4"
        placeholder="e.g., Small businesses struggled with expensive e-commerce solutions that required technical knowledge. This platform provides an affordable, easy-to-use alternative that anyone can set up in minutes."
      />
    </UFormField>

    <!-- Key Features -->
    <UFormField
      label="Key Features"
      :hint="autoFillHint('features') || '2-4 main features of your project'"
    >
      <div class="space-y-2">
        <div
          v-for="(feature, index) in data.features"
          :key="index"
          :ref="(el: Element | ComponentPublicInstance | null) => { if (el) featureRefs[index] = el as HTMLElement }"
          class="flex gap-2"
          @keydown.enter.prevent="handleFeatureEnter(index)"
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
      :hint="autoFillHint('technologies') || 'Technologies, languages, frameworks used'"
    >
      <div class="space-y-2">
        <div
          class="flex gap-2"
          @keydown.enter.prevent="addTech"
        >
          <UInput
            v-model="techInput"
            placeholder="Type a technology and press Enter"
            class="flex-1"
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
      :hint="autoFillHint('outcome') || 'Impact, metrics, or results achieved'"
    >
      <UTextarea
        v-model="data.outcome"
        :rows="3"
        placeholder="e.g., Used by 50+ small businesses, processing $100K+ in transactions monthly. Reduced setup time from days to 15 minutes."
      />
    </UFormField>

    <!-- Links -->
    <UFormField
      label="Links"
      :hint="autoFillHint('links') || 'GitHub, Demo, Documentation, etc.'"
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
