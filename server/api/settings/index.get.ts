import { useDb, settings } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  let [result] = await db.select().from(settings).where(eq(settings.id, 'default'))

  // Create default settings if none exist
  if (!result) {
    await db.insert(settings).values({
      id: 'default',
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedIn: '',
      github: '',
      website: ''
    })
    ;[result] = await db.select().from(settings).where(eq(settings.id, 'default'))
  }

  return result
})
