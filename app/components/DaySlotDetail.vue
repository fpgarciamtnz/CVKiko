<script setup lang="ts">
import type { TimeSlot } from '~/utils/slots'

const props = defineProps<{
  date: string
}>()

const { getOwnerSlotsForDate, ticketRequests } = useSchedule()

const ownerSlots = computed(() => getOwnerSlotsForDate(props.date))

const getSlotStatus = (slot: TimeSlot) => {
  if (ownerSlots.value.includes(slot)) {
    return { label: 'Owner using', color: 'error' as const, icon: 'i-lucide-x-circle' }
  }

  const pending = ticketRequests.value.find(
    r => r.status === 'pending'
      && r.dates.includes(props.date)
      && r.slots?.split(',').includes(slot)
  )
  if (pending) {
    return { label: 'Pending', color: 'warning' as const, icon: 'i-lucide-clock' }
  }

  const approved = ticketRequests.value.find(
    r => r.status === 'approved'
      && r.dates.includes(props.date)
      && r.slots?.split(',').includes(slot)
  )
  if (approved) {
    return { label: 'Approved', color: 'info' as const, icon: 'i-lucide-check-circle' }
  }

  return { label: 'Available', color: 'success' as const, icon: 'i-lucide-circle-check' }
}

const formattedDate = computed(() => {
  const parts = props.date.split('-').map(Number)
  const y = parts[0] ?? 0
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-calendar-days"
          class="w-5 h-5 text-primary"
        />
        <h3 class="font-semibold text-sm">
          {{ formattedDate }}
        </h3>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-for="slot in TIME_SLOTS"
        :key="slot"
        class="flex items-center justify-between p-3 rounded-lg"
        :class="{
          'bg-red-50 dark:bg-red-950/30': getSlotStatus(slot).color === 'error',
          'bg-yellow-50 dark:bg-yellow-950/30': getSlotStatus(slot).color === 'warning',
          'bg-blue-50 dark:bg-blue-950/30': getSlotStatus(slot).color === 'info',
          'bg-green-50 dark:bg-green-950/30': getSlotStatus(slot).color === 'success'
        }"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="SLOT_ICONS[slot]"
            class="w-5 h-5 text-gray-600 dark:text-gray-400"
          />
          <span class="text-sm font-medium">{{ SLOT_LABELS[slot] }}</span>
        </div>
        <UBadge
          :color="getSlotStatus(slot).color"
          variant="soft"
          size="sm"
        >
          {{ getSlotStatus(slot).label }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
