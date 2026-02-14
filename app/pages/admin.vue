<script setup lang="ts">
import type { TimeSlot } from '~/utils/slots'

const schedule = useSchedule()
const toast = useToast()

await Promise.all([
  schedule.fetchSchedule(),
  schedule.fetchRequests()
])

const activeTab = ref('schedule')

// ========== Schedule Tab ==========
const selectedDate = ref('')
const selectedSlots = ref<TimeSlot[]>([])

const loadSlotsForDate = () => {
  if (!selectedDate.value) {
    selectedSlots.value = []
    return
  }
  selectedSlots.value = [...schedule.getOwnerSlotsForDate(selectedDate.value)]
}

watch(selectedDate, loadSlotsForDate)

const toggleSlot = (slot: TimeSlot) => {
  if (selectedSlots.value.includes(slot)) {
    selectedSlots.value = selectedSlots.value.filter(s => s !== slot)
  } else {
    selectedSlots.value.push(slot)
  }
}

const savingSlots = ref(false)

const saveSlots = async () => {
  if (!selectedDate.value) return
  if (selectedSlots.value.length === 0) {
    toast.add({ title: 'Select at least one slot', color: 'warning' })
    return
  }

  savingSlots.value = true
  try {
    await schedule.addOwnerDates([{
      date: selectedDate.value,
      slots: serializeSlots(selectedSlots.value)
    }])
    toast.add({ title: 'Slots saved', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to save slots', color: 'error' })
  } finally {
    savingSlots.value = false
  }
}

const clearDate = async () => {
  if (!selectedDate.value) return
  try {
    await schedule.removeOwnerDate(selectedDate.value)
    selectedSlots.value = []
    toast.add({ title: 'Date cleared', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to clear date', color: 'error' })
  }
}

// ========== Requests Tab ==========
const updatingRequest = ref<string | null>(null)

const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
  updatingRequest.value = id
  try {
    await schedule.updateRequestStatus(id, status)
    toast.add({ title: `Request ${status}`, color: status === 'approved' ? 'success' : 'warning' })
  } catch {
    toast.add({ title: 'Failed to update request', color: 'error' })
  } finally {
    updatingRequest.value = null
  }
}

const formatSlotBadges = (slots: string | null): string[] => {
  if (!slots) return ['Full day']
  return parseSlots(slots).map(s => SLOT_LABELS[s].split(' (')[0]).filter((s): s is string => !!s)
}
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Admin Panel
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage your schedule and review ticket requests.
      </p>
    </div>

    <!-- Tab Switcher -->
    <div class="flex gap-2 mb-6">
      <UButton
        :variant="activeTab === 'schedule' ? 'solid' : 'ghost'"
        icon="i-lucide-calendar"
        @click="activeTab = 'schedule'"
      >
        Schedule
      </UButton>
      <UButton
        :variant="activeTab === 'requests' ? 'solid' : 'ghost'"
        icon="i-lucide-inbox"
        @click="activeTab = 'requests'"
      >
        Requests
        <UBadge
          v-if="schedule.pendingRequests.value.length > 0"
          color="warning"
          variant="solid"
          size="xs"
          class="ml-1"
        >
          {{ schedule.pendingRequests.value.length }}
        </UBadge>
      </UButton>
    </div>

    <!-- Schedule Tab -->
    <div v-if="activeTab === 'schedule'">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Date & Slot Picker -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Set Owner Schedule
            </h2>
          </template>

          <div class="space-y-4">
            <UFormField label="Select Date">
              <UInput
                v-model="selectedDate"
                type="date"
              />
            </UFormField>

            <div v-if="selectedDate">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Slots
              </p>
              <div class="space-y-2">
                <label
                  v-for="slot in TIME_SLOTS"
                  :key="slot"
                  class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                  :class="selectedSlots.includes(slot)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  @click="toggleSlot(slot)"
                >
                  <UCheckbox
                    :model-value="selectedSlots.includes(slot)"
                    @click.stop
                    @update:model-value="() => toggleSlot(slot)"
                  />
                  <UIcon
                    :name="SLOT_ICONS[slot]"
                    class="w-5 h-5 text-gray-500"
                  />
                  <span class="text-sm">{{ SLOT_LABELS[slot] }}</span>
                </label>
              </div>

              <div class="flex gap-2 mt-4">
                <UButton
                  :loading="savingSlots"
                  class="flex-1"
                  @click="saveSlots"
                >
                  Save Slots
                </UButton>
                <UButton
                  variant="soft"
                  color="error"
                  @click="clearDate"
                >
                  Clear All
                </UButton>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Scheduled Dates List -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Scheduled Dates
            </h2>
          </template>

          <div
            v-if="schedule.ownerDates.value.length === 0"
            class="text-center py-8 text-gray-500"
          >
            <UIcon
              name="i-lucide-calendar-x"
              class="w-12 h-12 mx-auto mb-2 text-gray-400"
            />
            <p>No dates scheduled yet</p>
          </div>

          <div
            v-else
            class="space-y-2"
          >
            <div
              v-for="entry in schedule.ownerDates.value"
              :key="entry.id"
              class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div class="flex items-center gap-3">
                <span class="text-sm font-mono font-medium">{{ entry.date }}</span>
                <div class="flex gap-1">
                  <UBadge
                    v-for="slot in parseSlots(entry.slots)"
                    :key="slot"
                    variant="soft"
                    color="error"
                    size="xs"
                  >
                    {{ SLOT_LABELS[slot].split(' (')[0] }}
                  </UBadge>
                </div>
              </div>
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="xs"
                @click="() => { selectedDate = entry.date; clearDate() }"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Requests Tab -->
    <div v-if="activeTab === 'requests'">
      <UCard>
        <div
          v-if="schedule.ticketRequests.value.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <UIcon
            name="i-lucide-inbox"
            class="w-12 h-12 mx-auto mb-2 text-gray-400"
          />
          <p>No requests yet</p>
        </div>

        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left py-3 px-2 font-medium">
                  Name
                </th>
                <th class="text-left py-3 px-2 font-medium">
                  Dates
                </th>
                <th class="text-left py-3 px-2 font-medium">
                  Duration
                </th>
                <th class="text-left py-3 px-2 font-medium">
                  Slots
                </th>
                <th class="text-left py-3 px-2 font-medium">
                  Status
                </th>
                <th class="text-left py-3 px-2 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="req in schedule.ticketRequests.value"
                :key="req.id"
                class="border-b dark:border-gray-800"
              >
                <td class="py-3 px-2">
                  <div>{{ req.name }}</div>
                  <div
                    v-if="req.email"
                    class="text-xs text-gray-500"
                  >
                    {{ req.email }}
                  </div>
                </td>
                <td class="py-3 px-2">
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="date in req.dates"
                      :key="date"
                      variant="soft"
                      color="neutral"
                      size="xs"
                    >
                      {{ date }}
                    </UBadge>
                  </div>
                </td>
                <td class="py-3 px-2">
                  <UBadge
                    variant="soft"
                    color="neutral"
                    size="xs"
                  >
                    {{ req.duration }}
                  </UBadge>
                </td>
                <td class="py-3 px-2">
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="slot in formatSlotBadges(req.slots)"
                      :key="slot"
                      variant="soft"
                      color="info"
                      size="xs"
                    >
                      {{ slot }}
                    </UBadge>
                  </div>
                </td>
                <td class="py-3 px-2">
                  <UBadge
                    :color="req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'"
                    variant="soft"
                    size="xs"
                  >
                    {{ req.status }}
                  </UBadge>
                </td>
                <td class="py-3 px-2">
                  <div
                    v-if="req.status === 'pending'"
                    class="flex gap-1"
                  >
                    <UButton
                      icon="i-lucide-check"
                      variant="soft"
                      color="success"
                      size="xs"
                      :loading="updatingRequest === req.id"
                      @click="updateStatus(req.id, 'approved')"
                    />
                    <UButton
                      icon="i-lucide-x"
                      variant="soft"
                      color="error"
                      size="xs"
                      :loading="updatingRequest === req.id"
                      @click="updateStatus(req.id, 'rejected')"
                    />
                  </div>
                  <span
                    v-else
                    class="text-xs text-gray-500"
                  >&mdash;</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
