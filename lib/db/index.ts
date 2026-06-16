import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ??
  process.env.NEON_DATABASE_URL ??
  process.env.NEON_POSTGRES_URL ??
  process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error(
    'No database connection string found. Set DATABASE_URL (or NEON_DATABASE_URL) in your environment.',
  )
}

export const pool = new Pool({
  connectionString,
})

export const db = drizzle(pool, { schema })
