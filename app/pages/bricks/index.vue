<script setup lang="ts">
import { BRICK_TYPE_CONFIG, BRICK_TYPES, type BrickType } from '~/utils/brick-types'
import type { Brick } from '~/composables/useBricks'

const { bricks, bricksByType, fetchBricks, createBrick, updateBrick, deleteBrick } = useBricks()
const toast = useToast()

await fetchBricks()

const activeTab = ref<BrickType | 'all'>('all')
const showForm = ref(false)
const editingBrick = ref<Brick | null>(null)
const deleteConfirmBrick = ref<Brick | null>(null)

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

function openCreateForm() {
  editingBrick.value = null
  showForm.value = true
}

function openEditForm(brick: Brick) {
  editingBrick.value = brick
  showForm.value = true
}

function confirmDelete(brick: Brick) {
  deleteConfirmBrick.value = brick
}

async function handleSubmit(data: Partial<Brick>) {
  try {
    if (editingBrick.value) {
      await updateBrick(editingBrick.value.id, data)
      toast.add({ title: 'Brick updated', color: 'success' })
    } else {
      await createBrick(data)
      toast.add({ title: 'Brick created', color: 'success' })
    }
    showForm.value = false
    editingBrick.value = null
  } catch {
    toast.add({ title: 'Failed to save brick', color: 'error' })
  }
}

async function handleDelete() {
  if (!deleteConfirmBrick.value) return

  try {
    await deleteBrick(deleteConfirmBrick.value.id)
    toast.add({ title: 'Brick deleted', color: 'success' })
    deleteConfirmBrick.value = null
  } catch {
    toast.add({ title: 'Failed to delete brick', color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Bricks
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage your experiences, education, projects, and skills
        </p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreateForm">
        Add Brick
      </UButton>
    </div>

    <!-- Tabs -->
    <UTabs
      v-model="activeTab"
      :items="tabs"
      class="mb-6"
    >
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
          <UBadge :label="String(item.count)" variant="subtle" size="xs" />
        </div>
      </template>
    </UTabs>

    <!-- Brick List -->
    <div v-if="filteredBricks.length > 0" class="grid md:grid-cols-2 gap-4">
      <BricksBrickCard
        v-for="brick in filteredBricks"
        :key="brick.id"
        :brick="brick"
        @edit="openEditForm"
        @delete="confirmDelete"
      />
    </div>

    <UCard v-else class="text-center py-12">
      <UIcon name="i-lucide-inbox" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No {{ activeTab === 'all' ? 'bricks' : BRICK_TYPE_CONFIG[activeTab as BrickType].pluralLabel.toLowerCase() }} yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Add your first {{ activeTab === 'all' ? 'brick' : BRICK_TYPE_CONFIG[activeTab as BrickType].label.toLowerCase() }} to get started.
      </p>
      <UButton icon="i-lucide-plus" @click="openCreateForm">
        Add {{ activeTab === 'all' ? 'Brick' : BRICK_TYPE_CONFIG[activeTab as BrickType].label }}
      </UButton>
    </UCard>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="showForm">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">
                {{ editingBrick ? 'Edit' : 'Create' }} Brick
              </h2>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                @click="showForm = false"
              />
            </div>
          </template>
          <BricksBrickForm
            :brick="editingBrick || undefined"
            @submit="handleSubmit"
            @cancel="showForm = false"
          />
        </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteConfirmBrick">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold text-red-600">Delete Brick</h2>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "<strong>{{ deleteConfirmBrick?.title }}</strong>"?
            This action cannot be undone.
          </p>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="deleteConfirmBrick = null"
              >
                Cancel
              </UButton>
              <UButton color="error" @click="handleDelete">
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
