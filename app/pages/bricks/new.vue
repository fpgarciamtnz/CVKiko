<script setup lang="ts">
/**
 * DEDICATED PAGE FOR NEW BRICK
 * - Full page with proper layout
 * - Sticky header with save button
 * - More space for complex forms
 */
import type { Brick } from '~/composables/useBricks'

const router = useRouter()
const { createBrick } = useBricks()
const toast = useToast()

const isSubmitting = ref(false)

async function handleSubmit(data: Partial<Brick>) {
  isSubmitting.value = true
  try {
    await createBrick(data)
    toast.add({
      title: 'Brick created successfully!',
      description: 'Your new brick has been added.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
    router.push('/bricks')
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : (e as { data?: { message?: string } })?.data?.message || 'Unknown error'
    toast.add({
      title: 'Failed to create brick',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/bricks')
}

const formRef = ref<{ submit: () => void } | null>(null)

function submitForm() {
  formRef.value?.submit()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Sticky Header -->
    <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <UContainer class="py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-arrow-left"
              to="/bricks"
            />
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Brick
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Add a new experience, education, project, or skill
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              variant="outline"
              color="neutral"
              @click="handleCancel"
            >
              Cancel
            </UButton>
            <UButton
              :loading="isSubmitting"
              @click="submitForm"
            >
              <UIcon
                name="i-lucide-plus"
                class="w-4 h-4 mr-2"
              />
              Create Brick
            </UButton>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- Main Content -->
    <UContainer class="py-8">
      <div class="max-w-4xl mx-auto">
        <UCard>
          <BricksBrickForm
            ref="formRef"
            hide-actions
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </UCard>

        <!-- Bottom action bar for mobile -->
        <div class="mt-6 flex justify-end gap-3 sm:hidden">
          <UButton
            variant="outline"
            color="neutral"
            class="flex-1"
            @click="handleCancel"
          >
            Cancel
          </UButton>
          <UButton
            :loading="isSubmitting"
            class="flex-1"
            @click="submitForm"
          >
            Create Brick
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
