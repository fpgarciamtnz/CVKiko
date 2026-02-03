<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import { BRICK_TYPE_CONFIG, formatDateRange, type BrickType } from '~/utils/brick-types'

const props = defineProps<{
  settings: Settings | null
  bricksByType: Record<BrickType, Brick[]>
}>()

const sectionOrder: BrickType[] = ['experience', 'education', 'project', 'skill', 'publication', 'custom']

const visibleSections = computed(() => {
  return sectionOrder.filter(type => props.bricksByType[type]?.length > 0)
})

// Simple markdown to HTML converter for CV
function renderMarkdown(content: string): string {
  if (!content) return ''

  return content
    // Headers (convert to bold)
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<strong class="text-sm uppercase tracking-wide">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong class="text-base">$1</strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    // Bullet points
    .replace(/^- (.+)$/gm, '• $1')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div class="cv-preview bg-white text-gray-900 p-8 min-h-[800px] shadow-lg">
    <!-- Header -->
    <header class="mb-6 pb-4 border-b-2 border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900">
        {{ settings?.name || 'Your Name' }}
      </h1>
      <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
        <span v-if="settings?.email" class="flex items-center gap-1">
          <UIcon name="i-lucide-mail" class="w-4 h-4" />
          {{ settings.email }}
        </span>
        <span v-if="settings?.phone" class="flex items-center gap-1">
          <UIcon name="i-lucide-phone" class="w-4 h-4" />
          {{ settings.phone }}
        </span>
        <span v-if="settings?.location" class="flex items-center gap-1">
          <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
          {{ settings.location }}
        </span>
        <a
          v-if="settings?.linkedIn"
          :href="settings.linkedIn"
          target="_blank"
          class="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <UIcon name="i-simple-icons-linkedin" class="w-4 h-4" />
          LinkedIn
        </a>
        <a
          v-if="settings?.github"
          :href="settings.github"
          target="_blank"
          class="flex items-center gap-1 text-gray-700 hover:underline"
        >
          <UIcon name="i-simple-icons-github" class="w-4 h-4" />
          GitHub
        </a>
        <a
          v-if="settings?.website"
          :href="settings.website"
          target="_blank"
          class="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <UIcon name="i-lucide-globe" class="w-4 h-4" />
          Website
        </a>
      </div>
    </header>

    <!-- Summary -->
    <section v-if="settings?.summary" class="mb-6">
      <p class="text-gray-700 leading-relaxed">
        {{ settings.summary }}
      </p>
    </section>

    <!-- Empty State -->
    <div
      v-if="visibleSections.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <UIcon name="i-lucide-file-text" class="w-16 h-16 mb-4" />
      <p class="text-lg">Select bricks to build your CV</p>
    </div>

    <!-- Sections -->
    <section
      v-for="type in visibleSections"
      :key="type"
      class="mb-6"
    >
      <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
        {{ BRICK_TYPE_CONFIG[type].pluralLabel }}
      </h2>

      <!-- Skills rendered as tags -->
      <template v-if="type === 'skill'">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="brick in bricksByType[type]"
            :key="brick.id"
            class="px-2 py-1 bg-gray-100 rounded text-sm"
          >
            {{ brick.title }}
          </span>
        </div>
      </template>

      <!-- Other sections with markdown content -->
      <template v-else>
        <div
          v-for="brick in bricksByType[type]"
          :key="brick.id"
          class="mb-4 last:mb-0"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-gray-900">
                {{ brick.title }}
              </h3>
              <p v-if="brick.frontmatter?.subtitle" class="text-gray-600 italic">
                {{ brick.frontmatter.subtitle }}
                <span v-if="brick.frontmatter?.location" class="text-gray-500">
                  | {{ brick.frontmatter.location }}
                </span>
              </p>
            </div>
            <span
              v-if="brick.frontmatter?.startDate"
              class="text-sm text-gray-500 whitespace-nowrap ml-4"
            >
              {{ formatDateRange(brick.frontmatter.startDate, brick.frontmatter.endDate) }}
            </span>
          </div>

          <!-- Rendered Markdown Content -->
          <div
            v-if="brick.content"
            class="mt-2 text-gray-700 text-sm leading-relaxed cv-content"
            v-html="renderMarkdown(brick.content)"
          />

          <div v-if="brick.tags?.length" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="tag in brick.tags"
              :key="tag"
              class="text-xs px-1.5 py-0.5 bg-gray-100 rounded"
            >
              {{ tag }}
            </span>
          </div>

          <a
            v-if="brick.frontmatter?.url"
            :href="brick.frontmatter.url"
            target="_blank"
            class="text-sm text-blue-600 hover:underline mt-1 inline-block"
          >
            {{ brick.frontmatter.url }}
          </a>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.cv-preview {
  font-family: 'Georgia', 'Times New Roman', serif;
}

.cv-content :deep(p) {
  margin-top: 0.5rem;
}

.cv-content :deep(strong) {
  font-weight: 600;
}

@media print {
  .cv-preview {
    box-shadow: none;
    padding: 0;
  }
}
</style>
