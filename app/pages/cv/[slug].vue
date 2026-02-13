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

const cvName = computed(() => data.value?.cv?.name || 'CV')
const cvBricks = computed(() => data.value?.bricks || [])
const cvSettings = computed(() => data.value?.settings || null)

useSeoMeta({
  title: `${cvName.value} - CV`,
  description: cvSettings.value?.summary || `CV for ${cvName.value}`,
  ogTitle: `${cvName.value} - CV`,
  ogDescription: cvSettings.value?.summary || `CV for ${cvName.value}`
})

function formatDate(date?: string) {
  if (!date) return ''
  return date
}

function dateRange(fm: Record<string, unknown>) {
  const start = formatDate(fm.startDate as string)
  const end = fm.endDate ? formatDate(fm.endDate as string) : 'Present'
  if (!start) return ''
  return `${start} — ${end}`
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <div class="max-w-3xl mx-auto px-6 py-12">
      <!-- Header -->
      <header class="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8">
        <h1 class="text-3xl font-bold mb-2">
          {{ cvSettings?.name || cvName }}
        </h1>
        <div
          v-if="cvSettings"
          class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400"
        >
          <span v-if="cvSettings.email">{{ cvSettings.email }}</span>
          <span v-if="cvSettings.phone">{{ cvSettings.phone }}</span>
          <span v-if="cvSettings.location">{{ cvSettings.location }}</span>
          <a
            v-if="cvSettings.linkedIn"
            :href="cvSettings.linkedIn"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >LinkedIn</a>
          <a
            v-if="cvSettings.github"
            :href="cvSettings.github"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >GitHub</a>
          <a
            v-if="cvSettings.website"
            :href="cvSettings.website"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >Website</a>
        </div>
        <p
          v-if="cvSettings?.summary"
          class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed"
        >
          {{ cvSettings.summary }}
        </p>
      </header>

      <!-- Bricks -->
      <div class="space-y-8">
        <article
          v-for="brick in cvBricks"
          :key="brick.id"
          class="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0"
        >
          <div class="flex items-start justify-between gap-4 mb-2">
            <div>
              <span class="inline-block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {{ brick.type }}
              </span>
              <h2 class="text-xl font-semibold">
                {{ brick.title }}
              </h2>
              <p
                v-if="brick.frontmatter?.subtitle"
                class="text-gray-600 dark:text-gray-400"
              >
                {{ brick.frontmatter.subtitle }}
              </p>
            </div>
            <span
              v-if="brick.frontmatter && dateRange(brick.frontmatter)"
              class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0"
            >
              {{ dateRange(brick.frontmatter) }}
            </span>
          </div>
          <div
            v-if="brick.content"
            class="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
          >
            {{ brick.content }}
          </div>
          <div
            v-if="brick.tags && brick.tags.length > 0"
            class="mt-3 flex flex-wrap gap-1.5"
          >
            <span
              v-for="tag in brick.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>

      <!-- Empty state -->
      <div
        v-if="cvBricks.length === 0"
        class="text-center py-16 text-gray-500"
      >
        <p>This CV has no content yet.</p>
      </div>

      <!-- Footer -->
      <footer class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <NuxtLink
          to="/"
          target="_blank"
          class="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Built with CVKiko
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
