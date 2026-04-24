import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const sqlite = new Database(DATABASE_URL)
const db = drizzle(sqlite)

const migrationsFolder = new URL('./drizzle', import.meta.url).pathname

console.log(`Running migrations from: ${migrationsFolder}`)

try {
  migrate(db, { migrationsFolder })
  console.log('✅ Migrations completed successfully')
} catch (error) {
  console.error('❌ Migration failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
