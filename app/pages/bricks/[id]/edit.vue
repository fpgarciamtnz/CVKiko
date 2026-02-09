<script setup lang="ts">
/**
 * DEDICATED PAGE FOR EDIT BRICK
 * - Full page with proper layout
 * - Loads existing brick data
 * - Sticky header with save button
 */
import type { Brick } from '~/composables/useBricks'
import { BRICK_TYPE_CONFIG } from '~/utils/brick-types'

const route = useRoute()
const router = useRouter()
const { updateBrick } = useBricks()
const toast = useToast()

const brickId = computed(() => route.params.id as string)
const isSubmitting = ref(false)

// Fetch the brick
const { data: brick, status } = await useFetch<Brick>(`/api/bricks/${brickId.value}`)

if (!brick.value && status.value !== 'pending') {
  throw createError({
    statusCode: 404,
    statusMessage: 'Brick not found'
  })
}

const brickConfig = computed(() => {
  if (!brick.value) return null
  return BRICK_TYPE_CONFIG[brick.value.type]
})

async function handleSubmit(data: Partial<Brick>) {
  isSubmitting.value = true
  try {
    await updateBrick(brickId.value, data)
    toast.add({
      title: 'Brick updated successfully!',
      description: 'Your changes have been saved.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
    router.push('/bricks')
  } catch {
    toast.add({
      title: 'Failed to update brick',
      description: 'Please try again.',
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

function submitForm() {
  const form = document.getElementById('brick-form') as HTMLFormElement
  if (form) {
    form.requestSubmit()
  }
}
</script>

<template>
  <div
    v-if="brick"
    class="min-h-screen bg-gray-50 dark:bg-gray-900"
  >
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
            <div class="flex items-center gap-3">
              <div
                v-if="brickConfig"
                class="p-2 rounded-lg"
                :style="{
                  backgroundColor: brickConfig.color.includes('blue') ? 'rgb(219 234 254)'
                    : brickConfig.color.includes('green') ? 'rgb(220 252 231)'
                      : brickConfig.color.includes('purple') ? 'rgb(243 232 255)'
                        : brickConfig.color.includes('orange') ? 'rgb(255 237 213)'
                          : brickConfig.color.includes('pink') ? 'rgb(252 231 243)'
                            : 'rgb(243 244 246)'
                }"
              >
                <UIcon
                  :name="brickConfig.icon"
                  class="w-5 h-5"
                  :class="brickConfig.color"
                />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit {{ brickConfig?.label || 'Brick' }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                  {{ brick.title }}
                </p>
              </div>
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
                name="i-lucide-save"
                class="w-4 h-4 mr-2"
              />
              Save Changes
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
            :brick="brick"
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
            Save Changes
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>

  <!-- Loading State -->
  <div
    v-else
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
  >
    <div class="text-center">
      <UIcon
        name="i-lucide-loader-2"
        class="w-12 h-12 animate-spin text-primary mx-auto mb-4"
      />
      <p class="text-gray-500">
        Loading brick...
      </p>
    </div>
  </div>
</template>
