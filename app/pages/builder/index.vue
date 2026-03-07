<script setup lang="ts">
import VueDraggable from 'vuedraggable'
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType } from '~/utils/brick-types'
import { CV_MODE_CONFIG, CV_MODES, type CVMode } from '~/utils/cv-modes'

const { bricks, bricksByType, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()
const {
  selectedBrickIds,
  selectedBricks,
  selectedBricksByType,
  flatOrderedBricks,
  sectionTypeOrder,
  contentOverrides,
  layoutMode,
  cvMode,
  toggleBrick,
  selectBricks,
  deselectAll,
  reorderBricks,
  reorderSections,
  setCVMode,
  setLayoutMode
} = useCVBuilder()

const { exportToPdf } = usePdfExport()

await Promise.all([
  fetchBricks(),
  fetchSettings()
])

const activeTab = ref<BrickType | 'all'>('all')
const showChat = ref(true)
const showPreview = ref(false)
const showShare = ref(false)
const showOrder = ref(false)
const chatTab = ref<'suggest' | 'optimize'>('suggest')

const tabs = computed(() => [
  { label: 'All', value: 'all' as const, icon: undefined as string | undefined, count: bricks.value.length },
  ...BRICK_TYPES.map(type => ({
    label: BRICK_TYPE_CONFIG[type].label,
    value: type,
    icon: BRICK_TYPE_CONFIG[type].icon as string | undefined,
    count: bricksByType.value[type]?.length || 0
  }))
])

const filteredBricks = computed(() => {
  if (activeTab.value === 'all') return bricks.value
  return bricksByType.value[activeTab.value] || []
})

// Section reordering data
const orderedSections = computed(() => {
  return sectionTypeOrder.value
    .filter(type => selectedBricksByType.value[type]?.length > 0)
    .map(type => ({
      type,
      label: BRICK_TYPE_CONFIG[type].pluralLabel,
      bricks: selectedBricksByType.value[type] || []
    }))
})

// Freeform reorder data
const freeformBrickList = computed(() => {
  return flatOrderedBricks.value.map(b => ({
    id: b.id,
    title: b.title,
    type: b.type,
    typeLabel: BRICK_TYPE_CONFIG[b.type].label,
    icon: BRICK_TYPE_CONFIG[b.type].icon
  }))
})

function handleSectionDragEnd() {
  const newOrder = orderedSections.value.map(s => s.type)
  // Merge back any section types that have no selected bricks
  const full = [...newOrder, ...sectionTypeOrder.value.filter(t => !newOrder.includes(t))]
  reorderSections(full)
}

function moveSectionUp(idx: number) {
  if (idx <= 0) return
  const current = [...sectionTypeOrder.value]
  const visibleTypes = orderedSections.value.map(s => s.type)
  const a = visibleTypes[idx]
  const b = visibleTypes[idx - 1]
  if (!a || !b) return
  const realIdx = current.indexOf(a)
  const prevRealIdx = current.indexOf(b)
  const tmp = current[realIdx]!
  current[realIdx] = current[prevRealIdx]!
  current[prevRealIdx] = tmp
  reorderSections(current)
}

function moveSectionDown(idx: number) {
  if (idx >= orderedSections.value.length - 1) return
  const current = [...sectionTypeOrder.value]
  const visibleTypes = orderedSections.value.map(s => s.type)
  const a = visibleTypes[idx]
  const b = visibleTypes[idx + 1]
  if (!a || !b) return
  const realIdx = current.indexOf(a)
  const nextRealIdx = current.indexOf(b)
  const tmp = current[realIdx]!
  current[realIdx] = current[nextRealIdx]!
  current[nextRealIdx] = tmp
  reorderSections(current)
}

function moveBrickUp(sectionIdx: number, brickIdx: number) {
  if (brickIdx <= 0) return
  const section = orderedSections.value[sectionIdx]
  if (!section) return
  const brickIds = section.bricks.map(b => b.id)
  const tmp = brickIds[brickIdx]!
  brickIds[brickIdx] = brickIds[brickIdx - 1]!
  brickIds[brickIdx - 1] = tmp
  updateBrickOrderForSection(section.type, brickIds)
}

function moveBrickDown(sectionIdx: number, brickIdx: number) {
  const section = orderedSections.value[sectionIdx]
  if (!section) return
  if (brickIdx >= section.bricks.length - 1) return
  const brickIds = section.bricks.map(b => b.id)
  const tmp = brickIds[brickIdx]!
  brickIds[brickIdx] = brickIds[brickIdx + 1]!
  brickIds[brickIdx + 1] = tmp
  updateBrickOrderForSection(section.type, brickIds)
}

function updateBrickOrderForSection(type: BrickType, newSectionIds: string[]) {
  // Rebuild brickOrder, replacing the bricks of this type with the new order
  const currentOrder = [...selectedBricks.value]
  // Insert the reordered bricks at the position of the first brick of this type
  const newOrder: string[] = []
  let inserted = false
  for (const b of currentOrder) {
    if (b.type === type) {
      if (!inserted) {
        newOrder.push(...newSectionIds)
        inserted = true
      }
    } else {
      newOrder.push(b.id)
    }
  }
  if (!inserted) newOrder.push(...newSectionIds)
  reorderBricks(newOrder)
}

// Freeform reorder
function moveFreeformBrickUp(idx: number) {
  if (idx <= 0) return
  const newOrder = flatOrderedBricks.value.map(b => b.id)
  const tmp = newOrder[idx]!
  newOrder[idx] = newOrder[idx - 1]!
  newOrder[idx - 1] = tmp
  reorderBricks(newOrder)
}

function moveFreeformBrickDown(idx: number) {
  if (idx >= flatOrderedBricks.value.length - 1) return
  const newOrder = flatOrderedBricks.value.map(b => b.id)
  const tmp = newOrder[idx]!
  newOrder[idx] = newOrder[idx + 1]!
  newOrder[idx + 1] = tmp
  reorderBricks(newOrder)
}

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

async function handleDownloadPdf() {
  await exportToPdf(settings.value, selectedBricksByType.value)
}

const modeOptions = CV_MODES.map(m => ({
  label: CV_MODE_CONFIG[m].label,
  value: m
}))
</script>

<template>
  <div class="h-full flex">
    <!-- Left Panel - Brick Selection -->
    <div class="w-1/3 border-r overflow-hidden flex flex-col print:hidden">
      <div class="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-3">
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

        <!-- CV Mode & Layout Toggle -->
        <div class="flex gap-2 mb-3">
          <USelectMenu
            :model-value="cvMode"
            :items="modeOptions"
            value-key="value"
            size="xs"
            class="flex-1"
            @update:model-value="setCVMode($event as CVMode)"
          >
            <template #leading>
              <UIcon
                :name="cvMode === 'academic' ? 'i-lucide-graduation-cap' : 'i-lucide-briefcase'"
                class="w-3 h-3"
              />
            </template>
          </USelectMenu>
          <UButtonGroup size="xs">
            <UButton
              :variant="layoutMode === 'grouped' ? 'solid' : 'ghost'"
              :color="layoutMode === 'grouped' ? 'primary' : 'neutral'"
              @click="setLayoutMode('grouped')"
            >
              Grouped
            </UButton>
            <UButton
              :variant="layoutMode === 'freeform' ? 'solid' : 'ghost'"
              :color="layoutMode === 'freeform' ? 'primary' : 'neutral'"
              @click="setLayoutMode('freeform')"
            >
              Free-form
            </UButton>
          </UButtonGroup>
        </div>

        <!-- Tabs -->
        <UTabs
          v-model="activeTab"
          :items="tabs"
          size="xs"
        >
          <template #default="{ item }">
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

        <!-- Reorder Panel -->
        <div
          v-if="selectedBricks.length > 0"
          class="mt-4 border-t pt-4"
        >
          <button
            class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 w-full"
            @click="showOrder = !showOrder"
          >
            <UIcon
              :name="showOrder ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="w-4 h-4"
            />
            <UIcon
              name="i-lucide-arrow-up-down"
              class="w-4 h-4"
            />
            Reorder Sections & Bricks
          </button>

          <div
            v-if="showOrder"
            class="mt-3 space-y-3"
          >
            <!-- Freeform Reorder -->
            <template v-if="layoutMode === 'freeform'">
              <div class="space-y-1">
                <div
                  v-for="(item, idx) in freeformBrickList"
                  :key="item.id"
                  class="flex items-center gap-1 text-xs py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <UIcon
                    :name="item.icon"
                    class="w-3 h-3 text-gray-400"
                  />
                  <span class="flex-1 truncate">{{ item.title }}</span>
                  <span class="text-gray-400 text-[10px]">{{ item.typeLabel }}</span>
                  <UButton
                    icon="i-lucide-chevron-up"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    :disabled="idx === 0"
                    class="!p-0.5"
                    @click="moveFreeformBrickUp(idx)"
                  />
                  <UButton
                    icon="i-lucide-chevron-down"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    :disabled="idx === freeformBrickList.length - 1"
                    class="!p-0.5"
                    @click="moveFreeformBrickDown(idx)"
                  />
                </div>
              </div>
            </template>

            <!-- Grouped Reorder -->
            <template v-else>
              <VueDraggable
                :model-value="orderedSections"
                item-key="type"
                handle=".section-handle"
                @end="handleSectionDragEnd"
              >
                <template #item="{ element: section, index: sIdx }">
                  <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mb-2">
                    <!-- Section Header -->
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-grip-vertical"
                        class="w-4 h-4 text-gray-400 cursor-grab section-handle"
                      />
                      <span class="text-xs font-semibold uppercase tracking-wide flex-1">
                        {{ section.label }}
                      </span>
                      <UButton
                        icon="i-lucide-chevron-up"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        :disabled="sIdx === 0"
                        class="!p-0.5"
                        @click="moveSectionUp(Number(sIdx))"
                      />
                      <UButton
                        icon="i-lucide-chevron-down"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        :disabled="Number(sIdx) === orderedSections.length - 1"
                        class="!p-0.5"
                        @click="moveSectionDown(Number(sIdx))"
                      />
                    </div>
                    <!-- Bricks in section -->
                    <div class="space-y-1 pl-5">
                      <div
                        v-for="(brick, bIdx) in section.bricks"
                        :key="brick.id"
                        class="flex items-center gap-1 text-xs py-0.5"
                      >
                        <span class="flex-1 truncate">{{ brick.title }}</span>
                        <UButton
                          icon="i-lucide-chevron-up"
                          variant="ghost"
                          color="neutral"
                          size="xs"
                          :disabled="bIdx === 0"
                          class="!p-0.5"
                          @click="moveBrickUp(Number(sIdx), Number(bIdx))"
                        />
                        <UButton
                          icon="i-lucide-chevron-down"
                          variant="ghost"
                          color="neutral"
                          size="xs"
                          :disabled="bIdx === section.bricks.length - 1"
                          class="!p-0.5"
                          @click="moveBrickDown(Number(sIdx), Number(bIdx))"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </VueDraggable>
            </template>
          </div>
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
            <UButton
              icon="i-lucide-car"
              variant="soft"
              color="warning"
              size="sm"
              :disabled="selectedBricks.length === 0"
              @click="showPreview = true"
            >
              Interactive Preview
            </UButton>
            <UButton
              icon="i-lucide-share-2"
              size="sm"
              :disabled="selectedBricks.length === 0"
              @click="showShare = true"
            >
              Save & Share
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
            :section-order="sectionTypeOrder"
            :content-overrides="contentOverrides"
            :layout-mode="layoutMode"
            :cv-mode="cvMode"
            :flat-ordered-bricks="flatOrderedBricks"
          />
        </div>
      </div>
    </div>

    <!-- Right Panel - AI Chat -->
    <div
      v-if="showChat"
      class="w-1/3 border-l overflow-hidden flex flex-col print:hidden"
    >
      <!-- Tabs -->
      <div class="flex border-b bg-white dark:bg-gray-900">
        <button
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            chatTab === 'suggest'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="chatTab = 'suggest'"
        >
          Suggest
        </button>
        <button
          :class="[
            'flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            chatTab === 'optimize'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
          @click="chatTab = 'optimize'"
        >
          Optimize
        </button>
      </div>

      <ChatChatPanel
        v-if="chatTab === 'suggest'"
        :bricks="bricks"
        @select-bricks="handleSelectBricks"
      />
      <ChatOptimizePanel
        v-else
      />
    </div>

    <!-- Preview Modal -->
    <BuilderPreviewModal
      v-model="showPreview"
      :bricks="selectedBricks"
      :settings="settings"
    />

    <!-- Share Modal -->
    <BuilderShareModal
      v-model="showShare"
      :brick-ids="[...selectedBrickIds]"
    />
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
