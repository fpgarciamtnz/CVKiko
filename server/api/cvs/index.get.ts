import { useDb, cvs } from '../../database'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  return await db.select().from(cvs).orderBy(cvs.createdAt)
})
