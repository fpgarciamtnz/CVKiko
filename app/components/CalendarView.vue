<script setup lang="ts">
const selectedDate = ref<string | null>(null)

const handleDayClick = (dateStr: string) => {
  selectedDate.value = selectedDate.value === dateStr ? null : dateStr
}

// Format a Date object to YYYY-MM-DD
function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div>
    <UCalendar
      :ui="{
        cellTrigger: 'cursor-pointer'
      }"
      @update:model-value="(val: any) => {
        if (val) {
          const d = val instanceof Date ? val : new Date(val)
          handleDayClick(formatDate(d))
        }
      }"
    />

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-red-500" />
        Owner using (full day)
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/40" />
        Owner using (partial)
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full ring-2 ring-yellow-400 bg-transparent" />
        Pending request
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full ring-2 ring-blue-400 bg-transparent" />
        Approved request
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full ring-2 ring-green-400 bg-transparent" />
        Today
      </div>
    </div>

    <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
      Click a date to see morning/midday/evening availability
    </p>

    <!-- Day Slot Detail Panel -->
    <div
      v-if="selectedDate"
      class="mt-4"
    >
      <DaySlotDetail :date="selectedDate" />
    </div>
  </div>
</template>
