import { useDb, requests } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ status: 'approved' | 'rejected' }>(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'Request ID is required' })
  }

  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    throw createError({ statusCode: 400, message: 'Valid status is required (approved or rejected)' })
  }

  const [existing] = await db.select().from(requests).where(eq(requests.id, id))

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  await db.update(requests).set({
    status: body.status,
    updatedAt: new Date()
  }).where(eq(requests.id, id))

  const [result] = await db.select().from(requests).where(eq(requests.id, id))
  return result
})
