<script setup lang="ts">
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

const cvName = computed(() => data.value?.cv?.name || 'Interactive CV')
const cvBricks = computed(() => data.value?.bricks || [])
const cvSettings = computed(() => data.value?.settings || null)

useSeoMeta({
  title: `${cvName.value} - Interactive CV`,
  description: cvSettings.value?.summary || `Interactive CV for ${cvName.value}`,
  ogTitle: `${cvName.value} - Interactive CV`,
  ogDescription: cvSettings.value?.summary || `Interactive CV for ${cvName.value}`
})
</script>

<template>
  <div class="h-screen w-screen relative">
    <ClientOnly>
      <InteractiveInteractiveScene
        :bricks="cvBricks"
        :settings="cvSettings"
      />
      <template #fallback>
        <div class="flex items-center justify-center h-full text-slate-500">
          <div class="text-center">
            <UIcon
              name="i-lucide-car"
              class="w-12 h-12 mx-auto mb-4 animate-pulse"
            />
            <p>Loading interactive experience...</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Built with CVKiko badge -->
    <div class="fixed bottom-4 right-4 z-50">
      <NuxtLink
        to="/"
        target="_blank"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full shadow-lg text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
      >
        <UIcon
          name="i-lucide-boxes"
          class="w-3.5 h-3.5"
        />
        Built with CVKiko
      </NuxtLink>
    </div>
  </div>
</template>
