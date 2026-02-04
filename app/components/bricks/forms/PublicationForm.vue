<script setup lang="ts">
import type { PublicationData } from '~/utils/brick-types'
import { PUBLICATION_TYPES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: PublicationData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: PublicationData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

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

const publicationTypeOptions = PUBLICATION_TYPES.map(pt => ({
  label: pt.label,
  value: pt.value
}))
</script>

<template>
  <div class="space-y-6">
    <!-- Title -->
    <UFormField label="Title" required>
      <UInput
        v-model="data.title"
        placeholder="e.g., Deep Learning Approaches to Natural Language Processing"
        icon="i-lucide-file-text"
      />
    </UFormField>

    <!-- Authors -->
    <UFormField label="Authors" hint="List all authors in order (highlight your name with asterisk *)">
      <div class="space-y-2">
        <div
          v-for="(author, index) in data.authors"
          :key="index"
          class="flex gap-2"
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
      <UFormField label="Publication Type" required>
        <USelectMenu
          v-model="data.publicationType"
          :items="publicationTypeOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Publication Venue" hint="Journal, Conference, Publisher name">
        <UInput
          v-model="data.publicationName"
          placeholder="e.g., Nature, IEEE Conference on AI"
          icon="i-lucide-book"
        />
      </UFormField>
    </div>

    <!-- Date & Citations -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UFormField label="Publication Date">
        <UInput v-model="data.date" type="month" />
      </UFormField>

      <UFormField label="Citations" hint="Optional">
        <UInputNumber
          v-model="data.citations"
          :min="0"
          placeholder="0"
        />
      </UFormField>

      <UFormField label="DOI" hint="Digital Object Identifier">
        <UInput
          v-model="data.doi"
          placeholder="e.g., 10.1000/xyz123"
        />
      </UFormField>
    </div>

    <!-- URL -->
    <UFormField label="Link" hint="URL to the publication">
      <UInput
        v-model="data.url"
        type="url"
        placeholder="https://..."
        icon="i-lucide-link"
      />
    </UFormField>

    <!-- Abstract -->
    <UFormField label="Abstract" hint="Brief summary of the publication">
      <UTextarea
        v-model="data.abstract"
        :rows="4"
        placeholder="A brief summary of the publication's content and findings..."
      />
    </UFormField>

    <!-- Your Contributions -->
    <UFormField label="Your Contributions" hint="What was your specific role?">
      <div class="space-y-2">
        <div
          v-for="(contribution, index) in data.contributions"
          :key="index"
          class="flex gap-2"
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
