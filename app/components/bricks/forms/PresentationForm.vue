<script setup lang="ts">
import type { PresentationData } from '~/utils/brick-types'
import { PRESENTATION_TYPES } from '~/utils/brick-types'

const props = defineProps<{
  modelValue: PresentationData
}>()

const emit = defineEmits<{
  'update:modelValue': [data: PresentationData]
}>()

const data = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const presentationTypeOptions = PRESENTATION_TYPES.map(pt => ({
  label: pt.label,
  value: pt.value
}))

// Co-authors management
const coAuthorInput = ref('')
function addCoAuthor() {
  const name = coAuthorInput.value.trim()
  if (name && !data.value.coAuthors.includes(name)) {
    data.value = {
      ...data.value,
      coAuthors: [...data.value.coAuthors, name]
    }
    coAuthorInput.value = ''
  }
}

function removeCoAuthor(name: string) {
  data.value = {
    ...data.value,
    coAuthors: data.value.coAuthors.filter(a => a !== name)
  }
}
</script>

<template>
  <div class="space-y-6">
    <UFormField
      label="Title"
      required
    >
      <UInput
        v-model="data.title"
        placeholder="e.g., Advances in Transformer Architecture"
        icon="i-lucide-file-text"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField
        label="Presentation Type"
        required
      >
        <USelectMenu
          v-model="data.presentationType"
          :items="presentationTypeOptions"
          value-key="value"
        />
      </UFormField>

      <UFormField label="Event/Conference">
        <UInput
          v-model="data.event"
          placeholder="e.g., NeurIPS 2024"
          icon="i-lucide-calendar-days"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Location">
        <UInput
          v-model="data.location"
          placeholder="e.g., Vancouver, Canada"
          icon="i-lucide-map-pin"
        />
      </UFormField>

      <UFormField label="Date">
        <UInput
          v-model="data.date"
          placeholder="e.g., Dec 2024"
          icon="i-lucide-calendar"
        />
      </UFormField>
    </div>

    <UCheckbox
      v-model="data.isInvited"
      label="This was an invited presentation"
    />

    <UFormField label="URL">
      <UInput
        v-model="data.url"
        type="url"
        placeholder="https://..."
        icon="i-lucide-link"
      />
    </UFormField>

    <UFormField
      label="Co-Authors"
      hint="Other presenters or collaborators"
    >
      <div class="space-y-2">
        <div
          class="flex gap-2"
          @keydown.enter.prevent="addCoAuthor"
        >
          <UInput
            v-model="coAuthorInput"
            placeholder="Type a name and press Enter"
            class="flex-1"
          />
          <UButton
            variant="soft"
            @click="addCoAuthor"
          >
            Add
          </UButton>
        </div>
        <div
          v-if="data.coAuthors.length"
          class="flex flex-wrap gap-1"
        >
          <UBadge
            v-for="author in data.coAuthors"
            :key="author"
            :label="author"
            variant="subtle"
            color="primary"
            class="cursor-pointer"
            @click="removeCoAuthor(author)"
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

    <UFormField
      label="Abstract"
      hint="Brief summary of the presentation"
    >
      <UTextarea
        v-model="data.abstract"
        :rows="4"
        placeholder="A brief summary of the presentation content..."
      />
    </UFormField>
  </div>
</template>
