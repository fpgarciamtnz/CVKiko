<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'

definePageMeta({
  layout: 'blank'
})

const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useFetch(`/api/cvs/${slug}/public`)

if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'CV not found'
  })
}

const cvName = computed(() => data.value?.cv?.name || 'CV')
const cvBricks = computed(() => (data.value?.bricks || []) as Brick[])
const cvSettings = computed(() => data.value?.settings || null)

useSeoMeta({
  title: `${cvName.value} - CV`,
  description: cvSettings.value?.summary || `CV for ${cvName.value}`,
  ogTitle: `${cvName.value} - CV`,
  ogDescription: cvSettings.value?.summary || `CV for ${cvName.value}`
})
</script>

<template>
  <div style="height: 100dvh; overflow: hidden;">
    <ClientOnly>
      <InteractiveScene
        :bricks="cvBricks"
        :settings="cvSettings"
      />
      <template #fallback>
        <div
          class="flex items-center justify-center flex-col gap-6"
          style="height: 100dvh; background-color: #264653;"
        >
          <svg
            class="w-10 h-10 animate-spin text-white/80"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p class="text-white/70 text-base">
            Loading interactive CV...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
