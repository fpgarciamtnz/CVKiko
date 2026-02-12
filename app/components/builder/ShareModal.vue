<script setup lang="ts">
const props = defineProps<{
  brickIds: string[]
}>()

const model = defineModel<boolean>()

const { saveCV, loading } = useSavedCVs()

const step = ref<'form' | 'done'>('form')
const name = ref('')
const slug = ref('')
const shareUrl = ref('')

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

watch(name, (val) => {
  slug.value = slugify(val)
})

const copied = ref(false)

async function handleSave() {
  if (!name.value.trim()) return
  const cv = await saveCV({
    name: name.value.trim(),
    slug: slug.value,
    brickIds: props.brickIds
  })
  if (cv) {
    const origin = window.location.origin
    shareUrl.value = `${origin}/cv/${cv.slug}`
    step.value = 'done'
  }
}

function handleCopy() {
  navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function handleClose() {
  model.value = false
  // Reset state after close animation
  setTimeout(() => {
    step.value = 'form'
    name.value = ''
    slug.value = ''
    shareUrl.value = ''
  }, 300)
}
</script>

<template>
  <UModal
    v-model:open="model"
    title="Save & Share CV"
    :ui="{ width: 'sm:max-w-lg' }"
  >
    <template #body>
      <!-- Step 1: Form -->
      <div
        v-if="step === 'form'"
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">CV Name</label>
          <UInput
            v-model="name"
            placeholder="e.g. Senior Frontend Developer"
            autofocus
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">URL Slug</label>
          <UInput
            v-model="slug"
            placeholder="senior-frontend-developer"
          >
            <template #leading>
              <span class="text-xs text-gray-400">/cv/</span>
            </template>
          </UInput>
          <p class="text-xs text-gray-500 mt-1">
            {{ brickIds.length }} bricks will be included
          </p>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            variant="ghost"
            color="neutral"
            @click="handleClose"
          >
            Cancel
          </UButton>
          <UButton
            :loading="loading"
            :disabled="!name.trim()"
            @click="handleSave"
          >
            Save & Get Link
          </UButton>
        </div>
      </div>

      <!-- Step 2: Share URL -->
      <div
        v-else
        class="space-y-4"
      >
        <div class="text-center mb-4">
          <UIcon
            name="i-lucide-check-circle"
            class="w-12 h-12 mx-auto mb-2 text-green-500"
          />
          <p class="font-semibold">
            CV saved!
          </p>
          <p class="text-sm text-gray-500">
            Share this link so others can explore your interactive CV.
          </p>
        </div>
        <div class="flex gap-2">
          <UInput
            :model-value="shareUrl"
            readonly
            class="flex-1"
          />
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            :color="copied ? 'success' : 'primary'"
            variant="soft"
            @click="handleCopy"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </UButton>
        </div>
        <div class="flex justify-between pt-2">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-external-link"
            :to="shareUrl"
            target="_blank"
          >
            Open in new tab
          </UButton>
          <UButton @click="handleClose">
            Done
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
