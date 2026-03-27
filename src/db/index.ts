import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'

import * as schema from './schema.ts'
import { DATABASE_URL } from '../config.ts'

const sqlite = new Database(DATABASE_URL)
export const db = drizzle({ client: sqlite, schema })
