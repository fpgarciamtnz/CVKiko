<script setup lang="ts">
import type { TimeSlot, Duration } from '~/utils/slots'

const schedule = useSchedule()
const toast = useToast()

await Promise.all([
  schedule.fetchSchedule(),
  schedule.fetchRequests()
])

const form = reactive({
  name: '',
  email: '',
  reason: '',
  dates: [] as string[],
  duration: '8h' as Duration,
  selectedSlots: [] as TimeSlot[]
})

const dateInput = ref('')

const addDate = () => {
  const d = dateInput.value
  if (d && !form.dates.includes(d)) {
    form.dates.push(d)
    updateAvailableSlots()
  }
  dateInput.value = ''
}

const removeDate = (date: string) => {
  form.dates = form.dates.filter(d => d !== date)
  updateAvailableSlots()
}

const availableSlots = ref<TimeSlot[]>([...TIME_SLOTS])

const updateAvailableSlots = () => {
  if (form.dates.length === 0) {
    availableSlots.value = [...TIME_SLOTS]
    return
  }
  const slotsPerDate = form.dates.map(d => schedule.getAvailableSlotsForDate(d))
  availableSlots.value = TIME_SLOTS.filter(slot =>
    slotsPerDate.every(dateSlots => dateSlots.includes(slot))
  ) as TimeSlot[]
  form.selectedSlots = form.selectedSlots.filter(s => availableSlots.value.includes(s))
}

const submitting = ref(false)

const submit = async () => {
  if (!form.name.trim()) {
    toast.add({ title: 'Name is required', color: 'error' })
    return
  }
  if (form.dates.length === 0) {
    toast.add({ title: 'Select at least one date', color: 'error' })
    return
  }

  submitting.value = true
  try {
    await schedule.submitRequest({
      dates: form.dates,
      name: form.name.trim(),
      email: form.email.trim(),
      reason: form.reason.trim(),
      duration: form.duration,
      slots: form.selectedSlots.length > 0 ? serializeSlots(form.selectedSlots) : undefined
    })
    toast.add({ title: 'Request submitted successfully!', color: 'success' })
    form.name = ''
    form.email = ''
    form.reason = ''
    form.dates = []
    form.duration = '8h'
    form.selectedSlots = []
  } catch {
    toast.add({ title: schedule.error.value ?? 'Failed to submit request', color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Request Ticket
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Check availability and submit a request to use the ticket.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Calendar -->
      <div>
        <CalendarView />
      </div>

      <!-- Request Form -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">
            Submit Request
          </h2>
        </template>

        <div class="space-y-4">
          <UFormField label="Your Name" required>
            <UInput
              v-model="form.name"
              placeholder="Enter your name"
            />
          </UFormField>

          <UFormField label="Email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
            />
          </UFormField>

          <UFormField label="Reason">
            <UTextarea
              v-model="form.reason"
              placeholder="Why do you need the ticket?"
              :rows="2"
            />
          </UFormField>

          <UFormField label="Dates" required>
            <div class="flex gap-2">
              <UInput
                v-model="dateInput"
                type="date"
                class="flex-1"
              />
              <UButton
                icon="i-lucide-plus"
                variant="soft"
                :disabled="!dateInput"
                @click="addDate"
              />
            </div>
            <div
              v-if="form.dates.length > 0"
              class="mt-2 flex flex-wrap gap-2"
            >
              <UBadge
                v-for="date in form.dates"
                :key="date"
                color="neutral"
                variant="soft"
                class="gap-1"
              >
                {{ date }}
                <UIcon
                  name="i-lucide-x"
                  class="w-3 h-3 cursor-pointer"
                  @click="removeDate(date)"
                />
              </UBadge>
            </div>
          </UFormField>

          <UFormField label="Duration">
            <URadioGroup
              v-model="form.duration"
              :items="DURATION_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
            />
          </UFormField>

          <UFormField label="Time Slots">
            <div
              v-if="availableSlots.length === 0"
              class="text-sm text-red-500"
            >
              No time slots available for the selected dates.
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <label
                v-for="slot in availableSlots"
                :key="slot"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <UCheckbox
                  :model-value="form.selectedSlots.includes(slot)"
                  @update:model-value="(val: boolean | 'indeterminate') => {
                    if (val === true) form.selectedSlots.push(slot)
                    else form.selectedSlots = form.selectedSlots.filter(s => s !== slot)
                  }"
                />
                <UIcon
                  :name="SLOT_ICONS[slot]"
                  class="w-4 h-4 text-gray-500"
                />
                <span class="text-sm">{{ SLOT_LABELS[slot] }}</span>
              </label>
            </div>
          </UFormField>

          <UButton
            block
            :loading="submitting"
            @click="submit"
          >
            Submit Request
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
