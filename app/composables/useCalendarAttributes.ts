import type { Schedule, TicketRequest } from '~/composables/useSchedule'

export interface CalendarDateInfo {
  isOwnerFullDay: boolean
  isOwnerPartialDay: boolean
  isPending: boolean
  isApproved: boolean
  isToday: boolean
}

export function useCalendarAttributes() {
  const { ownerDates, ticketRequests } = useSchedule()

  const today = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const getDateInfo = (dateStr: string): CalendarDateInfo => {
    const schedule = ownerDates.value.find(s => s.date === dateStr)
    const ownerSlots = schedule ? parseSlots(schedule.slots) : []

    const isOwnerFullDay = ownerSlots.length === 3
    const isOwnerPartialDay = ownerSlots.length > 0 && ownerSlots.length < 3

    const isPending = ticketRequests.value.some(
      r => r.status === 'pending' && r.dates.includes(dateStr)
    )
    const isApproved = ticketRequests.value.some(
      r => r.status === 'approved' && r.dates.includes(dateStr)
    )

    const isToday = dateStr === today.value

    return { isOwnerFullDay, isOwnerPartialDay, isPending, isApproved, isToday }
  }

  const getDateClasses = (dateStr: string): string => {
    const info = getDateInfo(dateStr)
    const classes: string[] = []

    if (info.isOwnerFullDay) {
      classes.push('bg-red-500 text-white rounded-full')
    } else if (info.isOwnerPartialDay) {
      classes.push('bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-full')
    }

    if (info.isPending) {
      classes.push('ring-2 ring-yellow-400')
    }

    if (info.isApproved) {
      classes.push('ring-2 ring-blue-400')
    }

    if (info.isToday && !info.isOwnerFullDay && !info.isOwnerPartialDay) {
      classes.push('ring-2 ring-green-400')
    }

    return classes.join(' ')
  }

  const ownerFullDayDates = computed(() =>
    ownerDates.value
      .filter(s => parseSlots(s.slots).length === 3)
      .map(s => s.date)
  )

  const ownerPartialDayDates = computed(() =>
    ownerDates.value
      .filter((s) => {
        const slots = parseSlots(s.slots)
        return slots.length > 0 && slots.length < 3
      })
      .map(s => s.date)
  )

  return {
    getDateInfo,
    getDateClasses,
    ownerFullDayDates,
    ownerPartialDayDates,
    today
  }
}
