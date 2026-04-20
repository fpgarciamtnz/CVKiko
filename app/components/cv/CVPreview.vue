<script setup lang="ts">
import type { Brick } from '~/composables/useBricks'
import type { Settings } from '~/composables/useSettings'
import type { LayoutMode } from '~/composables/useCVBuilder'
import { BRICK_TYPE_CONFIG, PUBLICATION_STATUSES, formatBrickDateRange, type BrickType, type PublicationData } from '~/utils/brick-types'
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

function getDateRange(brick: Brick): string {
  return formatBrickDateRange(brick)
}
</script>

<template>
  <div class="cv-preview">
    <!-- Header -->
    <header class="cv-header">
      <p
        v-if="isAcademic"
        class="cv-kicker"
      >
        Curriculum Vitae
      </p>
      <h1 class="cv-name">
        {{ settings?.name || 'Tu Nombre' }}
        <span
          v-if="settings?.pronouns"
          class="cv-pronouns"
        >({{ settings.pronouns }})</span>
      </h1>
      <!-- Academic subtitle -->
      <div
        v-if="isAcademic && (settings?.academicTitle || settings?.department || settings?.institution)"
        class="cv-academic-subtitle"
      >
        <span v-if="settings?.academicTitle">{{ settings.academicTitle }}</span>
        <span v-if="settings?.academicTitle && settings?.department">, </span>
        <span v-if="settings?.department">{{ settings.department }}</span>
        <span v-if="(settings?.academicTitle || settings?.department) && settings?.institution">, </span>
        <span v-if="settings?.institution">{{ settings.institution }}</span>
      </div>
      <div class="cv-contact">
        <span
          v-if="settings?.email"
          class="cv-contact-item"
        >
          <UIcon
            name="i-lucide-mail"
            class="cv-contact-icon"
          />
          {{ settings.email }}
        </span>
        <span
          v-if="settings?.phone"
          class="cv-contact-item"
        >
          <UIcon
            name="i-lucide-phone"
            class="cv-contact-icon"
          />
          {{ settings.phone }}
        </span>
        <span
          v-if="settings?.location"
          class="cv-contact-item"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="cv-contact-icon"
          />
          {{ settings.location }}
        </span>
        <a
          v-if="settings?.linkedIn"
          :href="settings.linkedIn"
          target="_blank"
          class="cv-contact-link"
        >
          <UIcon
            name="i-simple-icons-linkedin"
            class="cv-contact-icon"
          />
          LinkedIn
        </a>
        <a
          v-if="settings?.github"
          :href="settings.github"
          target="_blank"
          class="cv-contact-link"
        >
          <UIcon
            name="i-simple-icons-github"
            class="cv-contact-icon"
          />
          GitHub
        </a>
        <a
          v-if="settings?.website"
          :href="settings.website"
          target="_blank"
          class="cv-contact-link"
        >
          <UIcon
            name="i-lucide-globe"
            class="cv-contact-icon"
          />
          Sitio Web
        </a>
        <a
          v-if="isAcademic && settings?.orcid"
          :href="`https://orcid.org/${settings.orcid}`"
          target="_blank"
          class="cv-contact-link"
        >
          <UIcon
            name="i-lucide-fingerprint"
            class="cv-contact-icon"
          />
          ORCID
        </a>
      </div>
    </header>

    <!-- Summary -->
    <section
      v-if="settings?.summary"
      class="cv-summary"
    >
      <p class="cv-summary-text">
        {{ settings.summary }}
      </p>
    </section>

    <!-- Empty State -->
    <div
      v-if="visibleSections.length === 0 && freeformSections.length === 0"
      class="cv-empty-state"
    >
      <UIcon
        name="i-lucide-file-text"
        class="cv-empty-icon"
      />
      <p class="cv-empty-text">
        Selecciona bloques para construir tu CV
      </p>
    </div>

    <!-- Freeform Layout -->
    <template v-if="isFreeform && freeformSections.length > 0">
      <section
        v-for="(section, sIdx) in freeformSections"
        :key="`ff-${sIdx}`"
        class="cv-section"
      >
        <h2 class="cv-section-title">
          {{ BRICK_TYPE_CONFIG[section.type].pluralLabel }}
        </h2>

        <template v-if="section.type === 'skill'">
          <div class="cv-skill-list">
            <span
              v-for="brick in section.bricks"
              :key="brick.id"
              class="cv-skill-pill"
            >
              {{ brick.title }}
            </span>
          </div>
        </template>

        <template v-else>
          <div
            v-for="brick in section.bricks"
            :key="brick.id"
            class="cv-entry"
          >
            <div class="cv-entry-header">
              <div>
                <h3 class="cv-entry-title">
                  {{ brick.title }}
                </h3>
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="cv-entry-subtitle"
                >
                  {{ brick.frontmatter.subtitle }}
                  <span
                    v-if="brick.frontmatter?.location"
                    class="cv-entry-location"
                  >
                    | {{ brick.frontmatter.location }}
                  </span>
                </p>
              </div>
              <span
                v-if="getDateRange(brick)"
                class="cv-entry-date"
              >
                {{ getDateRange(brick) }}
              </span>
            </div>

            <div
              v-if="getBrickContent(brick)"
              class="cv-entry-content cv-content"
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
        class="cv-section"
      >
        <h2 class="cv-section-title">
          {{ BRICK_TYPE_CONFIG[type].pluralLabel }}
        </h2>

        <!-- Skills rendered as tags -->
        <template v-if="type === 'skill'">
          <div class="cv-skill-list">
            <span
              v-for="brick in bricksByType[type]"
              :key="brick.id"
              class="cv-skill-pill"
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
            class="cv-entry"
          >
            <div class="cv-entry-header">
              <div class="cv-entry-main">
                <h3 class="cv-entry-title">
                  {{ brick.title }}
                </h3>
                <!-- Authors with highlighting -->
                <p
                  v-if="(brick.structuredData as unknown as PublicationData)?.authors?.length"
                  class="cv-publication-authors"
                  v-html="highlightAuthor(
                    (brick.structuredData as unknown as PublicationData).authors.join(', '),
                    (brick.structuredData as unknown as PublicationData).authorHighlightName || ''
                  )"
                />
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="cv-entry-subtitle"
                >
                  {{ brick.frontmatter.subtitle }}
                </p>
              </div>
              <div class="cv-entry-meta">
                <span
                  v-if="(brick.structuredData as unknown as PublicationData)?.status"
                  class="cv-publication-status"
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
                  v-if="getDateRange(brick)"
                  class="cv-entry-date"
                >
                  {{ getDateRange(brick) }}
                </span>
              </div>
            </div>

            <div
              v-if="getBrickContent(brick)"
              class="cv-entry-content cv-content"
              v-html="renderMarkdown(getBrickContent(brick))"
            />

            <!-- DOI link -->
            <a
              v-if="(brick.structuredData as unknown as PublicationData)?.doi"
              :href="`https://doi.org/${(brick.structuredData as unknown as PublicationData).doi}`"
              target="_blank"
              class="cv-entry-link"
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
            class="cv-entry"
          >
            <div class="cv-entry-header">
              <div>
                <h3 class="cv-entry-title">
                  {{ brick.title }}
                </h3>
                <p
                  v-if="brick.frontmatter?.subtitle"
                  class="cv-entry-subtitle"
                >
                  {{ brick.frontmatter.subtitle }}
                  <span
                    v-if="brick.frontmatter?.location"
                    class="cv-entry-location"
                  >
                    | {{ brick.frontmatter.location }}
                  </span>
                </p>
              </div>
              <span
                v-if="getDateRange(brick)"
                class="cv-entry-date"
              >
                {{ getDateRange(brick) }}
              </span>
            </div>

            <!-- Rendered Markdown Content -->
            <div
              v-if="getBrickContent(brick)"
              class="cv-entry-content cv-content"
              v-html="renderMarkdown(getBrickContent(brick))"
            />

            <div
              v-if="brick.tags?.length"
              class="cv-tags"
            >
              <span
                v-for="tag in brick.tags"
                :key="tag"
                class="cv-tag"
              >
                {{ tag }}
              </span>
            </div>

            <a
              v-if="brick.frontmatter?.url"
              :href="brick.frontmatter.url"
              target="_blank"
              class="cv-entry-link"
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
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #fff;
  color: #0f172a;
  padding: 2rem;
  min-height: 1122px;
  border: 1px solid #d1d5db;
}

.cv-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.85rem;
  border-bottom: 2px solid #1f2937;
}

.cv-kicker {
  margin-bottom: 0.3rem;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #475569;
}

.cv-name {
  font-size: 1.8rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0f172a;
}

.cv-pronouns {
  margin-left: 0.35rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #475569;
}

.cv-academic-subtitle {
  margin-top: 0.2rem;
  font-size: 0.84rem;
  color: #334155;
}

.cv-contact {
  margin-top: 0.45rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem;
  font-size: 0.76rem;
  color: #334155;
}

.cv-contact > * {
  position: relative;
}

.cv-contact > *:not(:last-child)::after {
  content: '|';
  margin-left: 0.45rem;
  color: #94a3b8;
}

.cv-contact-icon {
  display: none;
}

.cv-contact-link {
  color: #1e3a8a;
  text-decoration: none;
}

.cv-contact-link:hover {
  text-decoration: underline;
}

.cv-summary {
  margin-bottom: 1.35rem;
}

.cv-summary-text {
  font-size: 0.84rem;
  color: #334155;
  line-height: 1.6;
}

.cv-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  color: #94a3b8;
}

.cv-empty-icon {
  width: 2.8rem;
  height: 2.8rem;
  margin-bottom: 0.75rem;
}

.cv-empty-text {
  font-size: 0.95rem;
}

.cv-section {
  margin-bottom: 1.2rem;
}

.cv-section-title {
  margin-bottom: 0.7rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #cbd5e1;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #1e293b;
}

.cv-skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.cv-skill-pill {
  padding: 0.22rem 0.45rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.15rem;
  background: #f8fafc;
  font-size: 0.74rem;
  color: #1e293b;
}

.cv-entry {
  margin-bottom: 0.9rem;
}

.cv-entry:last-child {
  margin-bottom: 0;
}

.cv-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.85rem;
}

.cv-entry-main {
  flex: 1;
}

.cv-entry-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cv-entry-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}

.cv-entry-subtitle {
  margin-top: 0.1rem;
  font-size: 0.8rem;
  font-style: italic;
  color: #334155;
}

.cv-entry-location {
  color: #64748b;
}

.cv-entry-date {
  white-space: nowrap;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: #475569;
}

.cv-publication-authors {
  margin-top: 0.1rem;
  font-size: 0.76rem;
  color: #334155;
}

.cv-publication-status {
  border: 1px solid #d1d5db;
  border-radius: 999px;
  font-size: 0.64rem;
  padding: 0.06rem 0.35rem;
}

.cv-entry-content {
  margin-top: 0.32rem;
  font-size: 0.79rem;
  color: #1e293b;
  line-height: 1.55;
}

.cv-tags {
  margin-top: 0.45rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.cv-tag {
  border: 1px solid #d1d5db;
  border-radius: 0.15rem;
  background: #f8fafc;
  font-size: 0.68rem;
  color: #334155;
  padding: 0.1rem 0.3rem;
}

.cv-entry-link {
  margin-top: 0.35rem;
  display: inline-block;
  font-size: 0.75rem;
  color: #1e3a8a;
  text-decoration: none;
}

.cv-entry-link:hover {
  text-decoration: underline;
}

.cv-content :deep(p) {
  margin-top: 0.35rem;
}

.cv-content :deep(strong) {
  font-weight: 600;
}

@media print {
  .cv-preview {
    padding: 0;
    border: 0;
    min-height: auto;
  }
}
</style>
