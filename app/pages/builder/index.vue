<script setup lang="ts">
import VueDraggable from 'vuedraggable'
import type { Brick } from '~/composables/useBricks'
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType } from '~/utils/brick-types'
import { CV_MODE_CONFIG, CV_MODES, type CVMode } from '~/utils/cv-modes'

interface ReorderSectionModel {
  type: BrickType
  label: string
  bricks: Brick[]
}

const { bricks, bricksByType, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()
const {
  selectedBrickIds,
  selectedBricks,
  sectionTypeOrder,
  contentOverrides,
  layoutMode,
  cvMode,
  placedSections,
  nonEmptyPlacedSections,
  orderedPlacements,
  toggleBrick,
  selectBricks,
  deselectAll,
  applyPlacedSections,
  setCVMode,
  setLayoutMode
} = useCVBuilder()

const { exportToPdf } = usePdfExport()
const { exportToMarkdown } = useMarkdownExport()

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
const reorderSectionsModel = ref<ReorderSectionModel[]>([])

const tabs = computed(() => [
  { label: 'Todos', value: 'all' as const, icon: undefined as string | undefined, count: bricks.value.length },
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

function buildReorderSectionsModel(): ReorderSectionModel[] {
  return placedSections.value.map(section => ({
    type: section.type,
    label: BRICK_TYPE_CONFIG[section.type].pluralLabel,
    bricks: [...section.bricks]
  }))
}

function syncReorderSectionsModel() {
  reorderSectionsModel.value = buildReorderSectionsModel()
}

watch(
  [placedSections, sectionTypeOrder],
  () => {
    syncReorderSectionsModel()
  },
  { immediate: true, deep: true }
)

function commitReorderState() {
  applyPlacedSections(
    reorderSectionsModel.value.map(section => ({
      type: section.type,
      brickIds: section.bricks.map(brick => brick.id)
    }))
  )
}

function handleReorderDragEnd() {
  commitReorderState()
}

function moveSectionUp(idx: number) {
  if (idx <= 0) return

  const model = [...reorderSectionsModel.value]
  const current = model[idx]
  const previous = model[idx - 1]
  if (!current || !previous) return

  model[idx - 1] = current
  model[idx] = previous
  reorderSectionsModel.value = model
  commitReorderState()
}

function moveSectionDown(idx: number) {
  if (idx >= reorderSectionsModel.value.length - 1) return

  const model = [...reorderSectionsModel.value]
  const current = model[idx]
  const next = model[idx + 1]
  if (!current || !next) return

  model[idx] = next
  model[idx + 1] = current
  reorderSectionsModel.value = model
  commitReorderState()
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
  await exportToPdf(settings.value, nonEmptyPlacedSections.value)
}

async function handleDownloadMarkdown() {
  await exportToMarkdown(settings.value, nonEmptyPlacedSections.value)
}

const modeOptions = CV_MODES.map(m => ({
  label: CV_MODE_CONFIG[m].label,
  value: m
}))

function getBrickConfig(type: unknown) {
  const normalizedType = BRICK_TYPES.includes(type as BrickType)
    ? type as BrickType
    : 'custom'
  return BRICK_TYPE_CONFIG[normalizedType]
}

const selectedBricksForInteractive = computed(() => {
  const placementMap = new Map(orderedPlacements.value.map(placement => [placement.brickId, placement.sectionType]))
  return selectedBricks.value.map(brick => ({
    ...brick,
    cvSectionType: placementMap.get(brick.id) || brick.type
  }))
})
</script>

<template>
  <div class="h-full flex">
    <!-- Left Panel - Brick Selection -->
    <div class="w-1/3 border-r overflow-hidden flex flex-col print:hidden">
      <div class="p-4 border-b bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">
              Seleccionar Bloques
            </h2>
            <p class="text-sm text-gray-500">
              {{ selectedBricks.length }} seleccionados
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
              Limpiar
            </UButton>
            <UButton
              variant="soft"
              size="xs"
              @click="selectAllFiltered"
            >
              Seleccionar Todo
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
              Agrupado
            </UButton>
            <UButton
              :variant="layoutMode === 'freeform' ? 'solid' : 'ghost'"
              :color="layoutMode === 'freeform' ? 'primary' : 'neutral'"
              @click="setLayoutMode('freeform')"
            >
              Libre
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
          <p>No hay bloques en esta categoria</p>
          <UButton
            to="/bricks"
            variant="link"
            class="mt-2"
          >
            Agregar bloques
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
            Reordenar Categorias y Bloques
          </button>

          <div
            v-if="showOrder"
            class="mt-3 space-y-3"
          >
            <VueDraggable
              v-model="reorderSectionsModel"
              item-key="type"
              handle=".section-handle"
              @end="handleReorderDragEnd"
            >
              <template #item="{ element: section, index: sIdx }">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mb-2">
                  <div class="flex items-center gap-1 mb-2">
                    <UIcon
                      name="i-lucide-grip-vertical"
                      class="w-4 h-4 text-gray-400 cursor-grab section-handle"
                    />
                    <span class="text-xs font-semibold uppercase tracking-wide flex-1">
                      {{ section.label }}
                    </span>
                    <UBadge
                      :label="String(section.bricks.length)"
                      variant="subtle"
                      size="xs"
                    />
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
                      :disabled="Number(sIdx) === reorderSectionsModel.length - 1"
                      class="!p-0.5"
                      @click="moveSectionDown(Number(sIdx))"
                    />
                  </div>

                  <VueDraggable
                    v-model="section.bricks"
                    item-key="id"
                    :group="{ name: 'builder-bricks' }"
                    handle=".brick-handle"
                    @end="handleReorderDragEnd"
                  >
                    <template #item="{ element: brick }">
                      <div class="flex items-center gap-2 px-2 py-1.5 rounded border bg-white dark:bg-gray-900 mb-1">
                        <UIcon
                          name="i-lucide-grip-vertical"
                          class="w-3.5 h-3.5 text-gray-400 cursor-grab brick-handle"
                        />
                        <UIcon
                          :name="getBrickConfig(brick.type).icon"
                          class="w-3.5 h-3.5 text-gray-500"
                        />
                        <span class="text-xs flex-1 truncate">{{ brick.title }}</span>
                        <span class="text-[10px] uppercase text-gray-400">{{ getBrickConfig(brick.type).label }}</span>
                      </div>
                    </template>
                  </VueDraggable>

                  <div
                    v-if="section.bricks.length === 0"
                    class="text-[11px] text-gray-400 border border-dashed rounded px-2 py-2"
                  >
                    Arrastra bloques aqui
                  </div>
                </div>
              </template>
            </VueDraggable>
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
            Vista Previa CV
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
              icon="i-lucide-file-down"
              variant="soft"
              color="neutral"
              size="sm"
              @click="handleDownloadMarkdown"
            >
              Markdown
            </UButton>
            <UButton
              icon="i-lucide-printer"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="handlePrint"
            >
              Imprimir
            </UButton>
            <UButton
              icon="i-lucide-car"
              variant="soft"
              color="warning"
              size="sm"
              :disabled="selectedBricks.length === 0"
              @click="showPreview = true"
            >
              Vista Interactiva
            </UButton>
            <UButton
              icon="i-lucide-share-2"
              size="sm"
              :disabled="selectedBricks.length === 0"
              @click="showShare = true"
            >
              Guardar y Compartir
            </UButton>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="flex-1 overflow-y-auto p-4 print:p-0 print:overflow-visible">
        <div class="max-w-[800px] mx-auto transform scale-90 origin-top">
          <CvCVPreview
            :settings="settings"
            :placement-sections="nonEmptyPlacedSections"
            :ordered-placements="orderedPlacements"
            :content-overrides="contentOverrides"
            :layout-mode="layoutMode"
            :cv-mode="cvMode"
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
          Sugerir
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
          Optimizar
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
      :bricks="selectedBricksForInteractive"
      :settings="settings"
      :section-order="sectionTypeOrder"
    />

    <!-- Share Modal -->
    <BuilderShareModal
      v-model="showShare"
      :placements="orderedPlacements"
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
