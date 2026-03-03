<script setup lang="ts">
import type { PublicationData } from '~/utils/brick-types'
import { PUBLICATION_TYPES, DOI_REGEX, normalizeDoi } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: PublicationData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: PublicationData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// DOI Lookup state
const doiInput = ref('')
const isLookingUp = ref(false)
const lookupError = ref('')
const lookupSuccess = ref(false)
const autoFilledFields = ref(new Set<string>())

async function lookupDoi() {
  const raw = doiInput.value.trim()
  if (!raw) return

  const normalized = normalizeDoi(raw)
  if (!DOI_REGEX.test(normalized)) {
    lookupError.value = 'Invalid DOI format. Expected format: 10.xxxx/...'
    lookupSuccess.value = false
    return
  }

  isLookingUp.value = true
  lookupError.value = ''
  lookupSuccess.value = false

  try {
    const result = await $fetch('/api/publications/lookup-doi', {
      method: 'POST',
      body: { doi: raw },
    })

    if (!result.found || !result.data) {
      lookupError.value = result.error || 'DOI not found'
      return
    }

    const filled = new Set<string>()
    const incoming = result.data
    const preserved = data.value.contributions

    const updates: Partial<PublicationData> = {}

    if (incoming.title) { updates.title = incoming.title; filled.add('title') }
    if (incoming.authors?.length) { updates.authors = incoming.authors; filled.add('authors') }
    if (incoming.publicationType) { updates.publicationType = incoming.publicationType; filled.add('publicationType') }
    if (incoming.publicationName) { updates.publicationName = incoming.publicationName; filled.add('publicationName') }
    if (incoming.date) { updates.date = incoming.date; filled.add('date') }
    if (incoming.abstract) { updates.abstract = incoming.abstract; filled.add('abstract') }
    if (incoming.doi) { updates.doi = incoming.doi; filled.add('doi') }
    if (incoming.url) { updates.url = incoming.url; filled.add('url') }
    if (incoming.citations !== undefined) { updates.citations = incoming.citations; filled.add('citations') }

    data.value = { ...data.value, ...updates, contributions: preserved }
    autoFilledFields.value = filled
    lookupSuccess.value = true

    // Sync doiInput with the resolved DOI
    if (incoming.doi) doiInput.value = incoming.doi
  }
  catch {
    lookupError.value = 'Failed to look up DOI. Please try again.'
  }
  finally {
    isLookingUp.value = false
  }
}

function autoFillHint(field: string): string | undefined {
  return autoFilledFields.value.has(field) ? 'Auto-filled' : undefined
}

// Authors management
function addAuthor() {
  data.value = {
    ...data.value,
    authors: [...data.value.authors, '']
  }
}

function removeAuthor(index: number) {
  data.value = {
    ...data.value,
    authors: data.value.authors.filter((_, i) => i !== index)
  }
}

function updateAuthor(index: number, value: string) {
  const updated = [...data.value.authors]
  updated[index] = value
  data.value = { ...data.value, authors: updated }
}

// Contributions management
function addContribution() {
  data.value = {
    ...data.value,
    contributions: [...data.value.contributions, '']
  }
}

function removeContribution(index: number) {
  data.value = {
    ...data.value,
    contributions: data.value.contributions.filter((_, i) => i !== index)
  }
}

function updateContribution(index: number, value: string) {
  const updated = [...data.value.contributions]
  updated[index] = value
  data.value = { ...data.value, contributions: updated }
}

// Refs for auto-focus on Enter
const authorRefs = ref<HTMLElement[]>([])
const contributionRefs = ref<HTMLElement[]>([])

function handleAuthorEnter(index: number) {
  if (data.value.authors[index]?.trim()) {
    addAuthor()
    nextTick(() => {
      const inputs = authorRefs.value
      const last = inputs[inputs.length - 1]
      last?.querySelector('input')?.focus()
    })
  }
}

function handleContributionEnter(index: number) {
  if (data.value.contributions[index]?.trim()) {
    addContribution()
    nextTick(() => {
      const inputs = contributionRefs.value
      const last = inputs[inputs.length - 1]
      last?.querySelector('input')?.focus()
    })
  }
}

const publicationTypeOptions = PUBLICATION_TYPES.map(pt => ({
  label: pt.label,
  value: pt.value
}))
</script>

<template>
  <div class="space-y-6">
    <!-- DOI Lookup Section -->
    <div class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-4 space-y-3">
      <div class="flex items-center gap-2 text-sm font-medium text-[var(--ui-text-highlighted)]">
        <UIcon name="i-lucide-search" />
        Auto-fill from DOI
      </div>
      <div class="flex gap-2">
        <UInput
          v-model="doiInput"
          placeholder="e.g., 10.1038/nature12373 or https://doi.org/..."
          icon="i-lucide-fingerprint"
          class="flex-1"
          @keydown.enter.prevent="lookupDoi"
        />
        <UButton
          :loading="isLookingUp"
          :disabled="!doiInput.trim()"
          icon="i-lucide-search"
          @click="lookupDoi"
        >
          Lookup
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
        title="Publication metadata loaded! Review and add your contributions below."
      />
    </div>

    <USeparator label="Publication Details" />

    <!-- Title -->
    <UFormField
      label="Title"
      required
      :hint="autoFillHint('title')"
    >
      <UInput
        v-model="data.title"
        placeholder="e.g., Deep Learning Approaches to Natural Language Processing"
        icon="i-lucide-file-text"
      />
    </UFormField>

    <!-- Authors -->
    <UFormField
      label="Authors"
      hint="List all authors in order (highlight your name with asterisk *)"
    >
      <template
        v-if="autoFilledFields.has('authors')"
        #hint
      >
        <span class="text-[var(--ui-success)]">Auto-filled</span>
        <span class="mx-1">&middot;</span>
        <span>Highlight your name with asterisk *</span>
      </template>
      <div class="space-y-2">
        <div
          v-for="(author, index) in data.authors"
          :key="index"
          :ref="(el: Element | ComponentPublicInstance | null) => { if (el) authorRefs[index] = el as HTMLElement }"
          class="flex gap-2"
          @keydown.enter.prevent="handleAuthorEnter(index)"
        >
          <UInput
            :model-value="author"
            :placeholder="index === 0 ? 'e.g., *John Smith (you)' : 'e.g., Jane Doe'"
            class="flex-1"
            @update:model-value="updateAuthor(index, $event)"
          />
          <UButton
            v-if="data.authors.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeAuthor(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addAuthor"
        >
          Add Author
        </UButton>
      </div>
    </UFormField>

    <!-- Publication Type & Venue -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Publication Type"
        required
        :hint="autoFillHint('publicationType')"
      >
        <USelectMenu
          v-model="data.publicationType"
          :items="publicationTypeOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField
        label="Publication Venue"
        :hint="autoFillHint('publicationName') || 'Journal, Conference, Publisher name'"
      >
        <UInput
          v-model="data.publicationName"
          placeholder="e.g., Nature, IEEE Conference on AI"
          icon="i-lucide-book"
        />
      </UFormField>
    </div>

    <!-- Date & Citations -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Publication Date"
        :hint="autoFillHint('date')"
      >
        <UInput
          v-model="data.date"
          type="month"
        />
      </UFormField>

      <UFormField
        label="Citations"
        :hint="autoFillHint('citations') || 'Optional'"
      >
        <UInputNumber
          v-model="data.citations"
          :min="0"
          placeholder="0"
        />
      </UFormField>
    </div>

    <!-- DOI (read-only display if auto-filled) & URL -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="DOI"
        :hint="autoFillHint('doi') || 'Digital Object Identifier'"
      >
        <UInput
          v-model="data.doi"
          placeholder="e.g., 10.1000/xyz123"
          icon="i-lucide-fingerprint"
        />
      </UFormField>

      <UFormField
        label="Link"
        :hint="autoFillHint('url') || 'URL to the publication'"
      >
        <UInput
          v-model="data.url"
          type="url"
          placeholder="https://..."
          icon="i-lucide-link"
        />
      </UFormField>
    </div>

    <!-- Abstract -->
    <UFormField
      label="Abstract"
      :hint="autoFillHint('abstract') || 'Brief summary of the publication'"
    >
      <UTextarea
        v-model="data.abstract"
        :rows="4"
        placeholder="A brief summary of the publication's content and findings..."
      />
    </UFormField>

    <USeparator label="Your Contributions" />

    <!-- Your Contributions -->
    <UFormField
      label="Your Contributions"
      hint="What was your specific role? (not auto-filled — always provide this)"
    >
      <div class="space-y-2">
        <div
          v-for="(contribution, index) in data.contributions"
          :key="index"
          :ref="(el: Element | ComponentPublicInstance | null) => { if (el) contributionRefs[index] = el as HTMLElement }"
          class="flex gap-2"
          @keydown.enter.prevent="handleContributionEnter(index)"
        >
          <UInput
            :model-value="contribution"
            placeholder="e.g., Designed and implemented the neural network architecture"
            class="flex-1"
            @update:model-value="updateContribution(index, $event)"
          />
          <UButton
            v-if="data.contributions.length > 1"
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="sm"
            @click="removeContribution(index)"
          />
        </div>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-lucide-plus"
          @click="addContribution"
        >
          Add Contribution
        </UButton>
      </div>
    </UFormField>
  </div>
</template>
