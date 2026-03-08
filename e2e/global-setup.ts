import Database from 'better-sqlite3'

const DB_PATH = 'dev.db'

async function globalSetup() {
  console.log('Setting up E2E test environment...')
  
  // Use dev.db (same as .env.local)
  const db = new Database(DB_PATH)
  
  console.log('Creating database tables...')
  
  // Create kanban_board table
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_board (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      columns_order TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  console.log('✓ kanban_board table created')
  
  // Create kanban_column table
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_column (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      kanban_board_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (kanban_board_id) REFERENCES kanban_board(id)
    )
  `)
  console.log('✓ kanban_column table created')
  
  // Create kanban_card table
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      kanban_board_id INTEGER NOT NULL,
      kanban_column_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (kanban_board_id) REFERENCES kanban_board(id),
      FOREIGN KEY (kanban_column_id) REFERENCES kanban_column(id)
    )
  `)
  console.log('✓ kanban_card table created')
  
  // Create todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `)
  console.log('✓ todos table created')
  
  // Create user_auth table (for OAuth authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_auth (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth_type TEXT NOT NULL,
      auth_provider TEXT NOT NULL,
      auth_value TEXT NOT NULL,
      last_used_at INTEGER DEFAULT (unixepoch()),
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  console.log('✓ user_auth table created')
  
  // Create unique index on user_auth
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS unique_auth_idx ON user_auth(auth_type, auth_provider, auth_value)
  `)
  console.log('✓ unique_auth_idx index created')
  
  // Create session table (for user sessions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES user_auth(id)
    )
  `)
  console.log('✓ session table created')
  
  // Verify all tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[]
  console.log('\nVerifying tables:', tables.map(t => t.name).join(', '))
  
  // Close the database so the server can use it
  db.close()
  
  console.log('\n✅ E2E test environment ready')
}

export default globalSetup
