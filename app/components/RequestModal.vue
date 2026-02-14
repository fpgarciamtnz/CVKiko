<script setup lang="ts">
import type { TimeSlot, Duration } from '~/utils/slots'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submitted': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const schedule = useSchedule()
const toast = useToast()

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
    // Reset slot selection when dates change
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
  // Find slots available across ALL selected dates
  const slotsPerDate = form.dates.map(d => schedule.getAvailableSlotsForDate(d))
  availableSlots.value = TIME_SLOTS.filter(slot =>
    slotsPerDate.every(dateSlots => dateSlots.includes(slot))
  ) as TimeSlot[]
  // Remove selected slots that are no longer available
  form.selectedSlots = form.selectedSlots.filter(s => availableSlots.value.includes(s))
}

const isFullyBlocked = (date: string) => {
  return schedule.getAvailableSlotsForDate(date).length === 0
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
    toast.add({ title: 'Request submitted!', color: 'success' })
    emit('submitted')
    resetForm()
    isOpen.value = false
  } catch {
    toast.add({ title: schedule.error.value ?? 'Failed to submit request', color: 'error' })
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.reason = ''
  form.dates = []
  form.duration = '8h'
  form.selectedSlots = []
  dateInput.value = ''
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-calendar-plus"
          class="w-5 h-5 text-primary"
        />
        <h3 class="font-semibold">
          Request Ticket
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Name -->
        <UFormField label="Your Name" required>
          <UInput
            v-model="form.name"
            placeholder="Enter your name"
          />
        </UFormField>

        <!-- Email -->
        <UFormField label="Email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
          />
        </UFormField>

        <!-- Reason -->
        <UFormField label="Reason">
          <UTextarea
            v-model="form.reason"
            placeholder="Why do you need the ticket?"
            :rows="2"
          />
        </UFormField>

        <!-- Date Selection -->
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
              :color="isFullyBlocked(date) ? 'error' : 'neutral'"
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

        <!-- Duration -->
        <UFormField label="Duration">
          <URadioGroup
            v-model="form.duration"
            :items="DURATION_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
          />
        </UFormField>

        <!-- Time Slots -->
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
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          @click="isOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          :loading="submitting"
          @click="submit"
        >
          Submit Request
        </UButton>
      </div>
    </template>
  </UModal>
</template>
