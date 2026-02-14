import type { TimeSlot, Duration } from '~/utils/slots'

export interface Schedule {
  id: string
  date: string
  ownerStatus: string
  slots: string
  createdAt: string | null
  updatedAt: string | null
}

export interface TicketRequest {
  id: string
  dates: string[]
  status: 'pending' | 'approved' | 'rejected'
  name: string
  email: string | null
  reason: string | null
  duration: Duration
  slots: string | null
  createdAt: string | null
  updatedAt: string | null
}

export function useSchedule() {
  const ownerDates = useState<Schedule[]>('schedule-dates', () => [])
  const ticketRequests = useState<TicketRequest[]>('ticket-requests', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSchedule = async () => {
    loading.value = true
    error.value = null
    try {
      ownerDates.value = await $fetch<Schedule[]>('/api/schedule')
    } catch (e) {
      error.value = 'Failed to load schedule'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    try {
      ticketRequests.value = await $fetch<TicketRequest[]>('/api/requests')
    } catch (e) {
      error.value = 'Failed to load requests'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const addOwnerDates = async (dates: Array<{ date: string, slots: string }>) => {
    loading.value = true
    error.value = null
    try {
      ownerDates.value = await $fetch<Schedule[]>('/api/schedule', {
        method: 'POST',
        body: { dates }
      })
    } catch (e) {
      error.value = 'Failed to save schedule'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const removeOwnerDate = async (date: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/schedule/${date}`, { method: 'DELETE' })
      ownerDates.value = ownerDates.value.filter(d => d.date !== date)
    } catch (e) {
      error.value = 'Failed to remove date'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const submitRequest = async (data: {
    dates: string[]
    name: string
    email?: string
    reason?: string
    duration: Duration
    slots?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<TicketRequest>('/api/requests', {
        method: 'POST',
        body: data
      })
      if (result) {
        ticketRequests.value.push(result)
      }
      return result
    } catch (e) {
      error.value = 'Failed to submit request'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<TicketRequest>(`/api/requests/${id}`, {
        method: 'PUT',
        body: { status }
      })
      const idx = ticketRequests.value.findIndex(r => r.id === id)
      if (idx !== -1 && result) {
        ticketRequests.value[idx] = result
      }
      return result
    } catch (e) {
      error.value = 'Failed to update request'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const getOwnerSlotsForDate = (date: string): TimeSlot[] => {
    const schedule = ownerDates.value.find(s => s.date === date)
    if (!schedule) return []
    return parseSlots(schedule.slots)
  }

  const getAvailableSlotsForDate = (date: string): TimeSlot[] => {
    const schedule = ownerDates.value.find(s => s.date === date)
    if (!schedule) return [...TIME_SLOTS]
    return getAvailableSlots(schedule.slots)
  }

  const pendingRequests = computed(() =>
    ticketRequests.value.filter(r => r.status === 'pending')
  )

  const approvedRequests = computed(() =>
    ticketRequests.value.filter(r => r.status === 'approved')
  )

  return {
    ownerDates,
    ticketRequests,
    loading,
    error,
    fetchSchedule,
    fetchRequests,
    addOwnerDates,
    removeOwnerDate,
    submitRequest,
    updateRequestStatus,
    getOwnerSlotsForDate,
    getAvailableSlotsForDate,
    pendingRequests,
    approvedRequests
  }
}
