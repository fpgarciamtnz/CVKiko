<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { LayoutMode } from '~/composables/useCVBuilder'
import { BRICK_TYPE_CONFIG, PUBLICATION_STATUSES, formatDateRange, type BrickType, type PublicationData } from '~/utils/brick-types'
import type { CVMode } from '~/utils/cv-modes'
import { renderMarkdown } from '~/utils/render-markdown'

const props = withDefaults(defineProps<{
  settings: Settings | null
  bricksByType: Record<BrickType, Brick[]>
  sectionOrder?: BrickType[]
  contentOverrides?: Record<string, string>
  layoutMode?: LayoutMode
  cvMode?: CVMode
  flatOrderedBricks?: Brick[]
}>(), {
  sectionOrder: () => ['experience', 'education', 'project', 'skill', 'publication', 'custom'] as BrickType[],
  contentOverrides: () => ({}),
  layoutMode: 'grouped',
  cvMode: 'industry',
  flatOrderedBricks: () => []
})

const isAcademic = computed(() => props.cvMode === 'academic')
const isFreeform = computed(() => props.layoutMode === 'freeform')

const visibleSections = computed(() => {
  return props.sectionOrder.filter(type => props.bricksByType[type]?.length > 0)
})

// For freeform mode: compute section breaks
const freeformSections = computed(() => {
  if (!isFreeform.value) return []
  const sections: { type: BrickType, bricks: Brick[] }[] = []
  let currentType: BrickType | null = null
  for (const brick of props.flatOrderedBricks) {
    if (brick.type !== currentType) {
      currentType = brick.type
      sections.push({ type: brick.type, bricks: [brick] })
    } else {
      sections[sections.length - 1]!.bricks.push(brick)
    }
  }
  return sections
})

function getBrickContent(brick: Brick): string {
  return props.contentOverrides[brick.id] || brick.content
}

function getPublicationStatusLabel(status: string): string {
  return PUBLICATION_STATUSES.find(s => s.value === status)?.label || status
}

function highlightAuthor(authorList: string, highlightName: string): string {
  if (!highlightName) return authorList
  return authorList.replace(
    new RegExp(`(${highlightName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<strong>$1</strong>'
  )
}
</script>

<template>
  <div class="cv-preview bg-white text-gray-900 p-8 min-h-[800px] shadow-lg">
    <!-- Header -->
    <header class="mb-6 pb-4 border-b-2 border-gray-200">
      <p
        v-if="isAcademic"
        class="text-xs uppercase tracking-widest text-gray-500 mb-1"
      >
        Curriculum Vitae
      </p>
      <h1 class="text-3xl font-bold text-gray-900">
        {{ settings?.name || 'Your Name' }}
        <span
          v-if="settings?.pronouns"
          class="text-base font-normal text-gray-500"
        >({{ settings.pronouns }})</span>
      </h1>
      <!-- Academic subtitle -->
      <div
        v-if="isAcademic && (settings?.academicTitle || settings?.department || settings?.institution)"
        class="mt-1 text-sm text-gray-600"
      >
        <span v-if="settings?.academicTitle">{{ settings.academicTitle }}</span>
        <span v-if="settings?.academicTitle && settings?.department">, </span>
        <span v-if="settings?.department">{{ settings.department }}</span>
        <span v-if="(settings?.academicTitle || settings?.department) && settings?.institution">, </span>
        <span v-if="settings?.institution">{{ settings.institution }}</span>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
        <span
          v-if="settings?.email"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-mail"
            class="w-4 h-4"
          />
          {{ settings.email }}
        </span>
        <span
          v-if="settings?.phone"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-phone"
            class="w-4 h-4"
          />
          {{ settings.phone }}
        </span>
        <span
          v-if="settings?.location"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="w-4 h-4"
          />
          {{ settings.location }}
        </span>
        <a
          v-if="settings?.linkedIn"
          :href="settings.linkedIn"
          target="_blank"
          class="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <UIcon
            name="i-simple-icons-linkedin"
            class="w-4 h-4"
          />
          LinkedIn
        </a>
        <a
          v-if="settings?.github"
          :href="settings.github"
          target="_blank"
          class="flex items-center gap-1 text-gray-700 hover:underline"
        >
          <UIcon
            name="i-simple-icons-github"
            class="w-4 h-4"
          />
          GitHub
        </a>
        <a
          v-if="settings?.website"
          :href="settings.website"
          target="_blank"
          class="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <UIcon
            name="i-lucide-globe"
            class="w-4 h-4"
          />
          Website
        </a>
        <a
          v-if="isAcademic && settings?.orcid"
          :href="`https://orcid.org/${settings.orcid}`"
          target="_blank"
          class="flex items-center gap-1 text-green-600 hover:underline"
        >
          <UIcon
            name="i-lucide-fingerprint"
            class="w-4 h-4"
          />
          ORCID
        </a>
      </div>
    </header>

    <!-- Summary -->
    <section
      v-if="settings?.summary"
      class="mb-6"
    >
      <p class="text-gray-700 leading-relaxed">
        {{ settings.summary }}
      </p>
    </section>

    <!-- Empty State -->
    <div
      v-if="visibleSections.length === 0 && freeformSections.length === 0"
      class="flex flex-col items-center justify-center py-20 text-gray-400"
    >
      <UIcon
        name="i-lucide-file-text"
        class="w-16 h-16 mb-4"
      />
      <p class="text-lg">
        Select bricks to build your CV
      </p>
    </div>

    <!-- Freeform Layout -->
    <template v-if="isFreeform && freeformSections.length > 0">
      <section
        v-for="(section, sIdx) in freeformSections"
        :key="`ff-${sIdx}`"
        class="mb-6"
      >
        <h2 class="text-lg font-bold text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-1 mb-3">
          {{ BRICK_TYPE_CONFIG[section.type].pluralLabel }}
        </h2>

        <template v-if="section.type === 'skill'">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="brick in section.bricks"
              :key="brick.id"
              class="px-2 py-1 bg-gray-100 rounded text-sm"
            >
              {{ brick.title }}
            </span>
          </div>
        </template>

        <template v-else>
          <div
            v-for="brick in section.bricks"
            :key="brick.id"
            class="mb-4 last:mb-0"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-900">
                  {{ brick.title }}
                </h3>
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="text-gray-600 italic"
                >
                  {{ brick.frontmatter.subtitle }}
                  <span
                    v-if="brick.frontmatter?.location"
                    class="text-gray-500"
                  >
                    | {{ brick.frontmatter.location }}
                  </span>
                </p>
              </div>
              <span
                v-if="brick.frontmatter?.startDate"
                class="text-sm text-gray-500 whitespace-nowrap ml-4"
              >
                {{ formatDateRange(brick.frontmatter.startDate, brick.frontmatter.endDate, section.type) }}
              </span>
            </div>

            <div
              v-if="getBrickContent(brick)"
              class="mt-2 text-gray-700 text-sm leading-relaxed cv-content"
              v-html="renderMarkdown(getBrickContent(brick))"
            />
          </div>
        </template>
      </section>
    </template>

    <!-- Grouped Layout (default) -->
    <template v-if="!isFreeform">
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

        <!-- Publications with academic enhancements -->
        <template v-else-if="type === 'publication' && isAcademic">
          <div
            v-for="brick in bricksByType[type]"
            :key="brick.id"
            class="mb-4 last:mb-0"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">
                  {{ brick.title }}
                </h3>
                <!-- Authors with highlighting -->
                <p
                  v-if="(brick.structuredData as unknown as PublicationData)?.authors?.length"
                  class="text-gray-600 text-sm"
                  v-html="highlightAuthor(
                    (brick.structuredData as unknown as PublicationData).authors.join(', '),
                    (brick.structuredData as unknown as PublicationData).authorHighlightName || ''
                  )"
                />
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="text-gray-600 italic text-sm"
                >
                  {{ brick.frontmatter.subtitle }}
                </p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span
                  v-if="(brick.structuredData as unknown as PublicationData)?.status"
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700': (brick.structuredData as unknown as PublicationData).status === 'published',
                    'bg-blue-100 text-blue-700': (brick.structuredData as unknown as PublicationData).status === 'in_press' || (brick.structuredData as unknown as PublicationData).status === 'accepted',
                    'bg-yellow-100 text-yellow-700': (brick.structuredData as unknown as PublicationData).status === 'under_review' || (brick.structuredData as unknown as PublicationData).status === 'submitted',
                    'bg-gray-100 text-gray-700': (brick.structuredData as unknown as PublicationData).status === 'preprint'
                  }"
                >
                  {{ getPublicationStatusLabel((brick.structuredData as unknown as PublicationData).status) }}
                </span>
                <span
                  v-if="brick.frontmatter?.startDate"
                  class="text-sm text-gray-500 whitespace-nowrap"
                >
                  {{ formatDateRange(brick.frontmatter.startDate, brick.frontmatter.endDate, type) }}
                </span>
              </div>
            </div>

            <div
              v-if="getBrickContent(brick)"
              class="mt-2 text-gray-700 text-sm leading-relaxed cv-content"
              v-html="renderMarkdown(getBrickContent(brick))"
            />

            <!-- DOI link -->
            <a
              v-if="(brick.structuredData as unknown as PublicationData)?.doi"
              :href="`https://doi.org/${(brick.structuredData as unknown as PublicationData).doi}`"
              target="_blank"
              class="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              DOI: {{ (brick.structuredData as unknown as PublicationData).doi }}
            </a>
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
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="text-gray-600 italic"
                >
                  {{ brick.frontmatter.subtitle }}
                  <span
                    v-if="brick.frontmatter?.location"
                    class="text-gray-500"
                  >
                    | {{ brick.frontmatter.location }}
                  </span>
                </p>
              </div>
              <span
                v-if="brick.frontmatter?.startDate"
                class="text-sm text-gray-500 whitespace-nowrap ml-4"
              >
                {{ formatDateRange(brick.frontmatter.startDate, brick.frontmatter.endDate, type) }}
              </span>
            </div>

            <!-- Rendered Markdown Content -->
            <div
              v-if="getBrickContent(brick)"
              class="mt-2 text-gray-700 text-sm leading-relaxed cv-content"
              v-html="renderMarkdown(getBrickContent(brick))"
            />

            <div
              v-if="brick.tags?.length"
              class="mt-2 flex flex-wrap gap-1"
            >
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
    </template>
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
