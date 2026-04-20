<script setup lang="ts">
/**
 * BRICKS PAGE - Combined Approach
 * - Drawer for quick create/edit
 * - Links to dedicated pages for full editing
 * - Clean, organized UI
 */
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType } from '~/utils/brick-types'
import type { Brick } from '~/composables/useBricks'

const { bricks, bricksByType, fetchBricks, createBrick, updateBrick, deleteBrick } = useBricks()
const toast = useToast()

await fetchBricks()

const activeTab = ref<BrickType | 'all'>('all')
const drawerOpen = ref(false)
const editingBrick = ref<Brick | null>(null)
const deleteConfirmBrick = ref<Brick | null>(null)
const isSubmitting = ref(false)

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

function openCreateDrawer() {
  editingBrick.value = null
  drawerOpen.value = true
}

function openEditDrawer(brick: Brick) {
  editingBrick.value = brick
  drawerOpen.value = true
}

function confirmDelete(brick: Brick) {
  deleteConfirmBrick.value = brick
}

async function handleSubmit(data: Partial<Brick>) {
  isSubmitting.value = true
  try {
    if (editingBrick.value) {
      await updateBrick(editingBrick.value.id, data)
      toast.add({ title: 'Bloque actualizado correctamente', color: 'success', icon: 'i-lucide-check-circle' })
    } else {
      await createBrick(data)
      toast.add({ title: 'Bloque creado correctamente', color: 'success', icon: 'i-lucide-check-circle' })
    }
    drawerOpen.value = false
    editingBrick.value = null
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : (e as { data?: { message?: string } })?.data?.message || 'Error desconocido'
    toast.add({ title: 'No se pudo guardar el bloque', description: message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!deleteConfirmBrick.value) return

  try {
    await deleteBrick(deleteConfirmBrick.value.id)
    toast.add({ title: 'Bloque eliminado', color: 'success', icon: 'i-lucide-check-circle' })
    deleteConfirmBrick.value = null
  } catch {
    toast.add({ title: 'No se pudo eliminar el bloque', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

// Form ref for external submit
const formRef = ref<{ submit: () => void } | null>(null)

function submitForm() {
  formRef.value?.submit()
}
</script>

<template>
  <UContainer class="py-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Bloques
        </h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          Gestiona experiencias, educacion, proyectos y habilidades
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="openCreateDrawer"
      >
        Agregar Bloque
      </UButton>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 overflow-x-auto">
      <UTabs
        v-model="activeTab"
        :items="tabs"
        variant="pill"
      >
        <template #default="{ item }">
          <div class="flex items-center gap-2">
            <UIcon
              v-if="item.icon"
              :name="item.icon"
              class="w-4 h-4"
            />
            <span>{{ item.label }}</span>
            <UBadge
              :label="String(item.count)"
              variant="subtle"
              size="xs"
            />
          </div>
        </template>
      </UTabs>
    </div>

    <!-- Brick Grid -->
    <div
      v-if="filteredBricks.length > 0"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="brick in filteredBricks"
        :key="brick.id"
        class="hover:shadow-md transition-shadow group"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Type Icon -->
            <div
              class="p-2.5 rounded-xl flex-shrink-0 transition-transform group-hover:scale-105"
              :style="{
                backgroundColor: BRICK_TYPE_CONFIG[brick.type].color.includes('blue') ? 'rgb(219 234 254)'
                  : BRICK_TYPE_CONFIG[brick.type].color.includes('green') ? 'rgb(220 252 231)'
                    : BRICK_TYPE_CONFIG[brick.type].color.includes('purple') ? 'rgb(243 232 255)'
                      : BRICK_TYPE_CONFIG[brick.type].color.includes('orange') ? 'rgb(255 237 213)'
                        : BRICK_TYPE_CONFIG[brick.type].color.includes('pink') ? 'rgb(252 231 243)'
                          : 'rgb(243 244 246)'
              }"
            >
              <UIcon
                :name="BRICK_TYPE_CONFIG[brick.type].icon"
                class="w-5 h-5"
                :class="BRICK_TYPE_CONFIG[brick.type].color"
              />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                {{ brick.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ BRICK_TYPE_CONFIG[brick.type].label }}
              </p>

              <!-- Tags -->
              <div
                v-if="brick.tags?.length"
                class="flex flex-wrap gap-1 mt-2"
              >
                <UBadge
                  v-for="tag in brick.tags.slice(0, 3)"
                  :key="tag"
                  :label="tag"
                  variant="subtle"
                  size="xs"
                />
                <UBadge
                  v-if="brick.tags.length > 3"
                  :label="`+${brick.tags.length - 3}`"
                  variant="subtle"
                  size="xs"
                  color="neutral"
                />
              </div>
            </div>
          </div>

          <!-- Actions Dropdown -->
          <UDropdownMenu
            :items="[
              [{
                label: 'Editar',
                icon: 'i-lucide-pencil',
                onSelect: () => openEditDrawer(brick)
              }],
              [{
                label: 'Eliminar',
                icon: 'i-lucide-trash-2',
                color: 'error' as const,
                onSelect: () => confirmDelete(brick)
              }]
            ]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              variant="ghost"
              color="neutral"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </UDropdownMenu>
        </div>
      </UCard>
    </div>

    <!-- Empty State -->
    <UCard
      v-else
      class="text-center py-16"
    >
      <UIcon
        name="i-lucide-inbox"
        class="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600"
      />
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Aun no hay {{ activeTab === 'all' ? 'bloques' : BRICK_TYPE_CONFIG[activeTab as BrickType].pluralLabel.toLowerCase() }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Agrega tu primer {{ activeTab === 'all' ? 'bloque' : BRICK_TYPE_CONFIG[activeTab as BrickType].label.toLowerCase() }} para empezar tu CV.
      </p>
      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="openCreateDrawer"
      >
        Agregar {{ activeTab === 'all' ? 'Bloque' : BRICK_TYPE_CONFIG[activeTab as BrickType].label }}
      </UButton>
    </UCard>

    <!-- MODAL FOR CREATE/EDIT -->
    <UModal
      v-model:open="drawerOpen"
      :ui="{
        content: 'max-w-3xl w-full max-h-[90vh] flex flex-col'
      }"
    >
      <template #content>
        <div class="flex flex-col h-full max-h-[90vh]">
          <!-- Fixed Header -->
          <div class="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ editingBrick ? 'Editar Bloque' : 'Crear Bloque Nuevo' }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ editingBrick ? 'Actualiza la informacion del bloque' : 'Completa los detalles del nuevo bloque' }}
                </p>
              </div>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                @click="drawerOpen = false"
              />
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto px-6 py-6">
            <BricksBrickForm
              ref="formRef"
              :brick="editingBrick || undefined"
              hide-actions
              @submit="handleSubmit"
              @cancel="drawerOpen = false"
            />
          </div>

          <!-- Fixed Footer with Save Button -->
          <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                color="neutral"
                @click="drawerOpen = false"
              >
                Cancelar
              </UButton>
              <UButton
                :loading="isSubmitting"
                @click="submitForm"
              >
                <UIcon
                  :name="editingBrick ? 'i-lucide-save' : 'i-lucide-plus'"
                  class="w-4 h-4 mr-2"
                />
                {{ editingBrick ? 'Guardar Cambios' : 'Crear Bloque' }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal
      :open="!!deleteConfirmBrick"
      @update:open="val => { if (!val) deleteConfirmBrick = null }"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <UIcon
                  name="i-lucide-trash-2"
                  class="w-5 h-5 text-red-600 dark:text-red-400"
                />
              </div>
              <h2 class="text-lg font-semibold">
                Eliminar Bloque
              </h2>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Seguro que quieres eliminar "<strong class="text-gray-900 dark:text-white">{{ deleteConfirmBrick?.title }}</strong>"?
            Esta accion no se puede deshacer.
          </p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                color="neutral"
                @click="deleteConfirmBrick = null"
              >
                Cancelar
              </UButton>
              <UButton
                color="error"
                @click="handleDelete"
              >
                <UIcon
                  name="i-lucide-trash-2"
                  class="w-4 h-4 mr-2"
                />
                Eliminar
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
