import { useDb, schedules } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<{
    dates: Array<{ date: string, slots: string }>
  }>(event)

  if (!body.dates || !Array.isArray(body.dates) || body.dates.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'At least one date entry is required'
    })
  }

  for (const entry of body.dates) {
    if (!entry.date || !entry.slots) {
      throw createError({
        statusCode: 400,
        message: 'Each entry must have a date and slots'
      })
    }

    const [existing] = await db.select().from(schedules).where(eq(schedules.date, entry.date))

    if (existing) {
      await db.update(schedules).set({
        slots: entry.slots,
        updatedAt: new Date()
      }).where(eq(schedules.date, entry.date))
    } else {
      await db.insert(schedules).values({
        id: crypto.randomUUID(),
        date: entry.date,
        slots: entry.slots
      })
    }
  }

  return await db.select().from(schedules).orderBy(schedules.date)
})
