import { useDb, schedules } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const date = getRouterParam(event, 'date')

  if (!date) {
    throw createError({
      statusCode: 400,
      message: 'Date is required'
    })
  }

  await db.delete(schedules).where(eq(schedules.date, date))

  return { success: true }
})
