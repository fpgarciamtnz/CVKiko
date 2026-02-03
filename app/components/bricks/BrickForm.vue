<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType, type BrickFrontmatter } from '~/utils/brick-types'

const props = defineProps<{
  brick?: Brick
}>()

const emit = defineEmits<{
  submit: [data: Partial<Brick>]
  cancel: []
}>()

const isEditing = computed(() => !!props.brick)

const formData = reactive({
  type: props.brick?.type || ('experience' as BrickType),
  title: props.brick?.title || '',
  content: props.brick?.content || '',
  tags: props.brick?.tags || [] as string[],
  frontmatter: { ...props.brick?.frontmatter } as BrickFrontmatter
})

const tagInput = ref('')

const currentConfig = computed(() => BRICK_TYPE_CONFIG[formData.type])

const typeOptions = BRICK_TYPES.map(type => ({
  label: BRICK_TYPE_CONFIG[type].label,
  value: type,
  icon: BRICK_TYPE_CONFIG[type].icon
}))

// Set template when type changes (only for new bricks)
watch(() => formData.type, (newType) => {
  if (!isEditing.value && !formData.content) {
    formData.content = BRICK_TYPE_CONFIG[newType].template
  }
})

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(tag: string) {
  formData.tags = formData.tags.filter(t => t !== tag)
}

function handleSubmit() {
  emit('submit', {
    type: formData.type,
    title: formData.title,
    content: formData.content,
    tags: formData.tags,
    frontmatter: formData.frontmatter
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Type selector (only for new bricks) -->
    <UFormField v-if="!isEditing" label="Type">
      <USelectMenu
        v-model="formData.type"
        :items="typeOptions"
        value-key="value"
        class="w-full"
      >
        <template #leading>
          <UIcon :name="currentConfig.icon" class="w-4 h-4" />
        </template>
      </USelectMenu>
    </UFormField>

    <!-- Title -->
    <UFormField label="Title" required>
      <UInput
        v-model="formData.title"
        placeholder="e.g., Senior Software Engineer at Google"
        required
      />
    </UFormField>

    <!-- Frontmatter fields -->
    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Subtitle / Company">
        <UInput
          v-model="formData.frontmatter.subtitle"
          placeholder="e.g., Google"
        />
      </UFormField>
      <UFormField label="Location">
        <UInput
          v-model="formData.frontmatter.location"
          placeholder="e.g., San Francisco, CA"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Start Date">
        <UInput v-model="formData.frontmatter.startDate" type="date" />
      </UFormField>
      <UFormField label="End Date">
        <UInput
          v-model="formData.frontmatter.endDate"
          type="date"
          placeholder="Leave empty for current"
        />
      </UFormField>
    </div>

    <UFormField label="URL">
      <UInput
        v-model="formData.frontmatter.url"
        type="url"
        placeholder="https://..."
      />
    </UFormField>

    <!-- Markdown Content -->
    <UFormField label="Content (Markdown)">
      <UTextarea
        v-model="formData.content"
        :rows="12"
        class="font-mono text-sm"
        placeholder="Write your content using Markdown..."
      />
      <template #hint>
        <span class="text-xs text-gray-500">
          Supports **bold**, *italic*, - bullet points, ## headings, [links](url)
        </span>
      </template>
    </UFormField>

    <!-- Tags -->
    <UFormField label="Tags">
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
        <div v-if="formData.tags.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in formData.tags"
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
    <div class="flex justify-end gap-2 pt-4">
      <UButton type="button" variant="ghost" color="neutral" @click="emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit">
        {{ isEditing ? 'Update' : 'Create' }} Brick
      </UButton>
    </div>
  </form>
</template>
