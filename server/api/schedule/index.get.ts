import { useDb, schedules } from '../../database'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  return await db.select().from(schedules).orderBy(schedules.date)
})
