import { useDb, settings, type Settings } from '../../database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<Partial<Settings>>(event)

  // Ensure default settings exist
  const [existing] = await db.select().from(settings).where(eq(settings.id, 'default'))

  if (!existing) {
    await db.insert(settings).values({
      id: 'default',
      name: body.name ?? '',
      email: body.email ?? '',
      phone: body.phone ?? '',
      location: body.location ?? '',
      summary: body.summary ?? '',
      linkedIn: body.linkedIn ?? '',
      github: body.github ?? '',
      website: body.website ?? ''
    })
  } else {
    await db.update(settings).set({
      ...body,
      updatedAt: new Date()
    }).where(eq(settings.id, 'default'))
  }

  const [result] = await db.select().from(settings).where(eq(settings.id, 'default'))
  return result
})
