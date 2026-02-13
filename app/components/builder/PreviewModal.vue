<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'

defineProps<{
  bricks: Brick[]
  settings: Settings | null
}>()

const model = defineModel<boolean>()
</script>

<template>
  <UModal
    v-model:open="model"
    fullscreen
    :close="false"
    :ui="{ content: 'p-0' }"
  >
    <template #content>
      <div class="fixed inset-0">
        <ClientOnly>
          <InteractiveInteractiveScene
            class="!h-screen !w-screen"
            :bricks="bricks"
            :settings="settings"
          />
          <template #fallback>
            <div class="flex items-center justify-center h-screen text-slate-500">
              <div class="text-center">
                <UIcon
                  name="i-lucide-car"
                  class="w-12 h-12 mx-auto mb-4 animate-pulse"
                />
                <p>Loading interactive preview...</p>
              </div>
            </div>
          </template>
        </ClientOnly>

        <!-- Close button -->
        <div class="fixed top-4 right-4 z-50">
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="lg"
            class="rounded-full shadow-lg"
            @click="model = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
