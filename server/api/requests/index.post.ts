import { useDb, schedules, requests } from '../../database'
import { inArray } from 'drizzle-orm'

const VALID_DURATIONS = ['4h', '8h', '12h', '24h'] as const

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<{
    dates: string[]
    name: string
    email?: string
    reason?: string
    duration: string
    slots?: string
  }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'Name is required' })
  }

  if (!body.dates || !Array.isArray(body.dates) || body.dates.length === 0) {
    throw createError({ statusCode: 400, message: 'At least one date is required' })
  }

  if (!body.duration || !VALID_DURATIONS.includes(body.duration as typeof VALID_DURATIONS[number])) {
    throw createError({ statusCode: 400, message: 'Valid duration is required (4h, 8h, 12h, 24h)' })
  }

  // Check for slot-level conflicts
  const existingSchedules = await db.select().from(schedules).where(
    inArray(schedules.date, body.dates)
  )

  const requestedSlots = body.slots ? body.slots.split(',') : []

  for (const schedule of existingSchedules) {
    const ownerSlots = schedule.slots ? schedule.slots.split(',') : []

    if (requestedSlots.length === 0) {
      // No specific slots requested — any owner slot is a conflict
      if (ownerSlots.length > 0) {
        throw createError({
          statusCode: 409,
          message: `Date ${schedule.date} conflicts with owner schedule`
        })
      }
    } else {
      // Check if requested slots overlap with owner slots
      const overlap = requestedSlots.filter(s => ownerSlots.includes(s))
      if (overlap.length > 0) {
        throw createError({
          statusCode: 409,
          message: `Date ${schedule.date} has conflicting slots: ${overlap.join(', ')}`
        })
      }
    }
  }

  const newRequest = {
    id: crypto.randomUUID(),
    dates: body.dates,
    name: body.name.trim(),
    email: body.email?.trim() || '',
    reason: body.reason?.trim() || '',
    duration: body.duration as typeof VALID_DURATIONS[number],
    slots: body.slots || null
  }

  await db.insert(requests).values(newRequest)

  const results = await db.select().from(requests)
  return results.find(r => r.id === newRequest.id)
})
