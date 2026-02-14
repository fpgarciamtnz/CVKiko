import { useDb, requests } from '../../database'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  return await db.select().from(requests).orderBy(requests.createdAt)
})
