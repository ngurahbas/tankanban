import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Database } from 'bun:sqlite'

import * as schema from './schema.ts'
import { DATABASE_URL } from '../config.ts'

const sqlite = new Database(DATABASE_URL)
export const db = drizzle({ client: sqlite, schema })

const migrationsFolder = new URL('../../drizzle', import.meta.url).pathname
migrate(db, { migrationsFolder })
