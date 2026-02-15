<script setup lang="ts">
import type { Settings } from '~/composables/useSettings'
import type { MapZone } from '~/utils/map-data'
import { formatDateRange } from '~/utils/brick-types'
import { renderMarkdown } from '~/utils/render-markdown'

const props = defineProps<{
  zone: MapZone | null
  settings: Settings | null
}>()

const isVisible = computed(() => props.zone !== null)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="isVisible && zone"
      class="absolute top-0 right-0 bottom-0 w-full sm:w-96 max-w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-l border-slate-300 dark:border-slate-600 overflow-y-auto z-30 shadow-2xl"
    >
      <div class="px-5 py-5">
        <!-- Section header -->
        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          <UIcon
            :name="zone.icon"
            class="w-6 h-6 text-slate-700 dark:text-slate-300"
          />
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            {{ zone.label }}
          </h2>
        </div>

        <!-- Hero content -->
        <template v-if="zone.type === 'hero'">
          <div class="space-y-3">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ settings?.name || 'Your Name' }}
            </h3>
            <p
              v-if="settings?.summary"
              class="text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              {{ settings.summary }}
            </p>
            <p
              v-if="settings?.location"
              class="text-sm text-slate-500 flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="w-4 h-4"
              />
              {{ settings.location }}
            </p>
          </div>
        </template>

        <!-- Contact content -->
        <template v-else-if="zone.type === 'contact'">
          <div class="space-y-3">
            <div
              v-if="settings?.email"
              class="flex items-center gap-2 text-slate-700 dark:text-slate-300"
            >
              <UIcon
                name="i-lucide-mail"
                class="w-5 h-5"
              />
              <span>{{ settings.email }}</span>
            </div>
            <div
              v-if="settings?.phone"
              class="flex items-center gap-2 text-slate-700 dark:text-slate-300"
            >
              <UIcon
                name="i-lucide-phone"
                class="w-5 h-5"
              />
              <span>{{ settings.phone }}</span>
            </div>
            <a
              v-if="settings?.linkedIn"
              :href="settings.linkedIn"
              target="_blank"
              class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <UIcon
                name="i-simple-icons-linkedin"
                class="w-5 h-5"
              />
              LinkedIn
            </a>
            <a
              v-if="settings?.github"
              :href="settings.github"
              target="_blank"
              class="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:underline"
            >
              <UIcon
                name="i-simple-icons-github"
                class="w-5 h-5"
              />
              GitHub
            </a>
            <a
              v-if="settings?.website"
              :href="settings.website"
              target="_blank"
              class="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <UIcon
                name="i-lucide-globe"
                class="w-5 h-5"
              />
              Website
            </a>
          </div>
        </template>

        <!-- Skill bricks (tag layout) -->
        <template v-else-if="zone.type === 'skill'">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="brick in zone.bricks"
              :key="brick.id"
              variant="subtle"
              color="neutral"
              size="lg"
            >
              {{ brick.title }}
            </UBadge>
          </div>
        </template>

        <!-- Standard brick content -->
        <template v-else>
          <div class="space-y-5">
            <div
              v-for="brick in zone.bricks"
              :key="brick.id"
              class="pb-4 last:pb-0 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div class="flex justify-between items-start gap-4">
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    {{ brick.title }}
                  </h3>
                  <p
                    v-if="brick.frontmatter?.subtitle"
                    class="text-sm text-slate-600 dark:text-slate-400 italic"
                  >
                    {{ brick.frontmatter.subtitle }}
                    <span
                      v-if="brick.frontmatter?.location"
                      class="text-slate-500"
                    >
                      | {{ brick.frontmatter.location }}
                    </span>
                  </p>
                </div>
                <span
                  v-if="brick.frontmatter?.startDate"
                  class="text-xs text-slate-500 whitespace-nowrap"
                >
                  {{ formatDateRange(brick.frontmatter.startDate as string, brick.frontmatter.endDate as string) }}
                </span>
              </div>

              <div
                v-if="brick.content"
                class="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed panel-content"
                v-html="renderMarkdown(brick.content)"
              />

              <div
                v-if="brick.tags?.length"
                class="mt-2 flex flex-wrap gap-1"
              >
                <UBadge
                  v-for="tag in brick.tags"
                  :key="tag"
                  variant="subtle"
                  color="neutral"
                  size="xs"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-content :deep(p) {
  margin-top: 0.5rem;
}

.panel-content :deep(strong) {
  font-weight: 600;
}
</style>
