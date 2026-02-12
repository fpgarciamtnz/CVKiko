import { drizzle } from 'drizzle-orm/libsql'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { createClient } from '@libsql/client'
import type { H3Event } from 'h3'
import * as schema from './schema'

// Local development database instance
let localDb: ReturnType<typeof drizzle> | null = null

function getLocalDb() {
  if (!localDb) {
    const client = createClient({
      url: 'file:./data/cvkiko.db'
    })
    localDb = drizzle(client, { schema })
  }
  return localDb
}

// Get database - works in both local dev and Cloudflare D1
export function useDb(event?: H3Event) {
  // Check for Cloudflare D1 binding in event context
  const d1 = event?.context?.cloudflare?.env?.DB
  if (d1) {
    return drizzleD1(d1, { schema })
  }

  // Fallback to local SQLite for development
  return getLocalDb()
}

export * from './schema'
