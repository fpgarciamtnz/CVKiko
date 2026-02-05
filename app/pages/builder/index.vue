<script setup lang="ts">
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType } from '~/utils/brick-types'

const { bricks, bricksByType, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()
const {
  selectedBrickIds,
  selectedBricks,
  selectedBricksByType,
  toggleBrick,
  selectBricks,
  deselectAll
} = useCVBuilder()

const { exportToPdf } = usePdfExport()

await Promise.all([
  fetchBricks(),
  fetchSettings()
])

const activeTab = ref<BrickType | 'all'>('all')
const showChat = ref(true)

const tabs = computed(() => [
  { label: 'All', value: 'all', count: bricks.value.length },
  ...BRICK_TYPES.map(type => ({
    label: BRICK_TYPE_CONFIG[type].label,
    value: type,
    icon: BRICK_TYPE_CONFIG[type].icon,
    count: bricksByType.value[type]?.length || 0
  }))
])

const filteredBricks = computed(() => {
  if (activeTab.value === 'all') return bricks.value
  return bricksByType.value[activeTab.value] || []
})

function selectAllFiltered() {
  const ids = filteredBricks.value.map(b => b.id)
  selectBricks(ids)
}

function handleSelectBricks(ids: string[]) {
  selectBricks(ids)
}

function handlePrint() {
  window.print()
}

function handleDownloadPdf() {
  exportToPdf(settings.value, selectedBricksByType.value)
}
</script>

<template>
  <div class="h-[calc(100vh-120px)] flex">
    <!-- Left Panel - Brick Selection -->
    <div class="w-1/3 border-r overflow-hidden flex flex-col print:hidden">
      <div class="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold">
              Select Bricks
            </h2>
            <p class="text-sm text-gray-500">
              {{ selectedBricks.length }} selected
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              v-if="selectedBricks.length > 0"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="deselectAll"
            >
              Clear
            </UButton>
            <UButton
              variant="soft"
              size="xs"
              @click="selectAllFiltered"
            >
              Select All
            </UButton>
          </div>
        </div>

        <!-- Tabs -->
        <UTabs
          v-model="activeTab"
          :items="tabs"
          size="xs"
        >
          <template #item="{ item }">
            <div class="flex items-center gap-1">
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="w-3 h-3"
              />
              <span class="text-xs">{{ item.label }}</span>
            </div>
          </template>
        </UTabs>
      </div>

      <!-- Brick List -->
      <div class="flex-1 overflow-y-auto p-3">
        <div
          v-if="filteredBricks.length === 0"
          class="text-center py-12 text-gray-500"
        >
          <UIcon
            name="i-lucide-inbox"
            class="w-12 h-12 mx-auto mb-2 opacity-50"
          />
          <p>No bricks in this category</p>
          <UButton
            to="/bricks"
            variant="link"
            class="mt-2"
          >
            Add bricks
          </UButton>
        </div>

        <div
          v-else
          class="space-y-2"
        >
          <BricksBrickCard
            v-for="brick in filteredBricks"
            :key="brick.id"
            :brick="brick"
            selectable
            :selected="selectedBrickIds.has(brick.id)"
            @select="toggleBrick"
          />
        </div>
      </div>
    </div>

    <!-- Middle Panel - CV Preview -->
    <div
      :class="[
        'overflow-hidden flex flex-col bg-gray-100 dark:bg-gray-800',
        showChat ? 'w-1/3' : 'w-2/3'
      ]"
    >
      <!-- Preview Controls -->
      <div class="p-4 border-b bg-white dark:bg-gray-900 print:hidden">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            CV Preview
          </h2>
          <div class="flex gap-2">
            <UButton
              :icon="showChat ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="showChat = !showChat"
            />
            <UButton
              icon="i-lucide-download"
              variant="soft"
              size="sm"
              @click="handleDownloadPdf"
            >
              PDF
            </UButton>
            <UButton
              icon="i-lucide-printer"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="handlePrint"
            >
              Print
            </UButton>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="flex-1 overflow-y-auto p-4 print:p-0 print:overflow-visible">
        <div class="max-w-[800px] mx-auto transform scale-90 origin-top">
          <CvCVPreview
            :settings="settings"
            :bricks-by-type="selectedBricksByType"
          />
        </div>
      </div>
    </div>

    <!-- Right Panel - AI Chat -->
    <div
      v-if="showChat"
      class="w-1/3 border-l overflow-hidden flex flex-col print:hidden"
    >
      <ChatChatPanel
        :bricks="bricks"
        @select-bricks="handleSelectBricks"
      />
    </div>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  .cv-preview,
  .cv-preview * {
    visibility: visible;
  }

  .cv-preview {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    transform: none !important;
  }
}
</style>
