<script setup lang="ts">
import {
  ROADMAP_PHASES,
  DIFFICULTY_CONFIG,
  getTotalTasks,
  getPhaseTaskIds,
  type RoadmapPhase,
  type RoadmapTask
} from '~/utils/roadmap-data'

const STORAGE_KEY = 'cvkiko-roadmap-completed'

const completedTasks = ref<Set<string>>(new Set())
const expandedPhases = ref<Set<string>>(new Set([ROADMAP_PHASES[0].id]))

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      completedTasks.value = new Set(JSON.parse(stored))
    }
    catch {
      // ignore malformed data
    }
  }
})

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedTasks.value]))
}

function toggleTask(taskId: string) {
  const next = new Set(completedTasks.value)
  if (next.has(taskId)) {
    next.delete(taskId)
  }
  else {
    next.add(taskId)
  }
  completedTasks.value = next
  persist()
}

function togglePhase(phaseId: string) {
  const next = new Set(expandedPhases.value)
  if (next.has(phaseId)) {
    next.delete(phaseId)
  }
  else {
    next.add(phaseId)
  }
  expandedPhases.value = next
}

const totalTasks = getTotalTasks()

const overallCompleted = computed(() => completedTasks.value.size)
const overallPercent = computed(() => Math.round((overallCompleted.value / totalTasks) * 100))

function phaseCompleted(phase: RoadmapPhase): number {
  return getPhaseTaskIds(phase).filter(id => completedTasks.value.has(id)).length
}

function phasePercent(phase: RoadmapPhase): number {
  return Math.round((phaseCompleted(phase) / phase.tasks.length) * 100)
}

function isPhaseComplete(phase: RoadmapPhase): boolean {
  return phaseCompleted(phase) === phase.tasks.length
}

const exporting = ref(false)

async function downloadPdf() {
  exporting.value = true
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const checkPageBreak = (height: number) => {
      if (y + height > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    // Title
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('CVKiko Learning Roadmap', margin, y)
    y += 10

    // Subtitle
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`${totalTasks} skills across 6 phases  |  Progress: ${overallPercent.value}%`, margin, y)
    doc.setTextColor(0, 0, 0)
    y += 10

    for (const phase of ROADMAP_PHASES) {
      checkPageBreak(25)

      // Phase header
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(phase.title, margin, y)
      y += 1
      doc.setLineWidth(0.4)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5

      // Phase description
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 100, 100)
      const descLines = doc.splitTextToSize(phase.description, contentWidth)
      doc.text(descLines, margin, y)
      doc.setTextColor(0, 0, 0)
      y += descLines.length * 3.5 + 3

      // Tasks
      for (const task of phase.tasks) {
        checkPageBreak(18)

        const done = completedTasks.value.has(task.id)
        const checkbox = done ? '[x]' : '[ ]'
        const diffLabel = DIFFICULTY_CONFIG[task.difficulty].label
        const aiLabel = task.aiAssisted ? '  |  AI-Friendly' : ''

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`${checkbox}  ${task.skill}`, margin + 2, y)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 120)
        const meta = `${diffLabel}${aiLabel}`
        const metaWidth = doc.getTextWidth(meta)
        doc.text(meta, pageWidth - margin - metaWidth, y)
        doc.setTextColor(0, 0, 0)
        y += 4

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const taskLines = doc.splitTextToSize(task.description, contentWidth - 4)
        doc.text(taskLines, margin + 4, y)
        y += taskLines.length * 3.5 + 4
      }

      y += 4
    }

    doc.save(`cvkiko-roadmap-${new Date().toISOString().split('T')[0]}.pdf`)
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Learning Roadmap
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ totalTasks }} skills across 6 phases — learn one by one with AI assistance.
        </p>
      </div>
      <UButton
        icon="i-lucide-download"
        :loading="exporting"
        @click="downloadPdf"
      >
        Download PDF
      </UButton>
    </div>

    <!-- Overall Progress -->
    <UCard class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Overall Progress
        </span>
        <span class="text-sm font-semibold text-primary">
          {{ overallCompleted }}/{{ totalTasks }} completed ({{ overallPercent }}%)
        </span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          class="bg-primary rounded-full h-3 transition-all duration-300"
          :style="{ width: `${overallPercent}%` }"
        />
      </div>
    </UCard>

    <!-- Phases -->
    <div class="space-y-4">
      <UCard
        v-for="phase in ROADMAP_PHASES"
        :key="phase.id"
      >
        <!-- Phase Header (clickable) -->
        <button
          class="w-full text-left flex items-center justify-between gap-4"
          @click="togglePhase(phase.id)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <UIcon
              :name="expandedPhases.has(phase.id) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="w-5 h-5 shrink-0 text-gray-500"
            />
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="font-semibold text-gray-900 dark:text-white">
                  {{ phase.title }}
                </h2>
                <UBadge
                  v-if="isPhaseComplete(phase)"
                  color="green"
                  variant="subtle"
                >
                  Complete
                </UBadge>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ phase.description }}
              </p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ phaseCompleted(phase) }}/{{ phase.tasks.length }}
            </span>
            <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                class="bg-primary rounded-full h-1.5 transition-all duration-300"
                :style="{ width: `${phasePercent(phase)}%` }"
              />
            </div>
          </div>
        </button>

        <!-- Phase Tasks (collapsible) -->
        <div
          v-if="expandedPhases.has(phase.id)"
          class="mt-4 space-y-3 border-t pt-4"
        >
          <div
            v-for="task in phase.tasks"
            :key="task.id"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            @click="toggleTask(task.id)"
          >
            <UCheckbox
              :model-value="completedTasks.has(task.id)"
              class="mt-0.5"
              @click.stop
              @update:model-value="toggleTask(task.id)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="font-medium"
                  :class="completedTasks.has(task.id) ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'"
                >
                  {{ task.skill }}
                </span>
                <UBadge
                  :color="DIFFICULTY_CONFIG[task.difficulty].color"
                  variant="subtle"
                  size="sm"
                >
                  {{ DIFFICULTY_CONFIG[task.difficulty].label }}
                </UBadge>
                <UBadge
                  v-if="task.aiAssisted"
                  color="blue"
                  variant="subtle"
                  size="sm"
                >
                  <UIcon
                    name="i-lucide-sparkles"
                    class="w-3 h-3 mr-0.5"
                  />
                  AI-Friendly
                </UBadge>
              </div>
              <p
                class="text-sm mt-1"
                :class="completedTasks.has(task.id) ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'"
              >
                {{ task.description }}
              </p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
