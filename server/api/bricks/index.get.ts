import { db, bricks } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as string | undefined

  if (type) {
    return await db.select().from(bricks).where(eq(bricks.type, type as any)).orderBy(bricks.sortOrder)
  }

  return await db.select().from(bricks).orderBy(bricks.sortOrder)
})
