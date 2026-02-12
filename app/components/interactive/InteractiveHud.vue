<script setup lang="ts">
import type { BrickType } from '~/utils/brick-types'

interface SceneSection {
  id: string
  label: string
  icon: string
  type: 'hero' | 'contact' | BrickType
  x: number
}

const _props = defineProps<{
  sections: SceneSection[]
  activeSectionId: string | null
  carX: number
}>()

const emit = defineEmits<{
  jump: [sectionId: string]
}>()
</script>

<template>
  <div class="absolute top-0 left-0 right-0 z-40 pointer-events-none">
    <!-- Keyboard hint -->
    <div class="absolute top-4 left-4 pointer-events-auto">
      <div class="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
        <span class="inline-flex items-center gap-1">
          <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono text-[10px]">&larr;</kbd>
          <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono text-[10px]">&rarr;</kbd>
        </span>
        <span>Drive to explore</span>
      </div>
    </div>

    <!-- Section navigation dots -->
    <div
      v-if="sections.length > 0"
      class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto"
    >
      <div class="flex items-center gap-1.5 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700">
        <button
          v-for="section in sections"
          :key="section.id"
          class="group relative w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
          :class="activeSectionId === section.id
            ? 'bg-amber-400 scale-125'
            : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'"
          :title="section.label"
          @click="emit('jump', section.id)"
        >
          <!-- Tooltip -->
          <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {{ section.label }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
