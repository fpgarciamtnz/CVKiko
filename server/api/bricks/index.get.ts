import { useDb, bricks } from '../../database'
import { eq } from 'drizzle-orm'
import type { BrickType } from '~/utils/brick-types'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const query = getQuery(event)
  const type = query.type as string | undefined

  if (type) {
    return await db.select().from(bricks).where(eq(bricks.type, type as BrickType)).orderBy(bricks.sortOrder)
  }

  return await db.select().from(bricks).orderBy(bricks.sortOrder)
})
