import Database from 'better-sqlite3'
import { existsSync, unlinkSync } from 'fs'

const DB_PATH = 'e2e-test.db'

async function globalSetup() {
  console.log('Setting up E2E test environment...')
  
  // Clean up any existing test database
  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH)
    console.log('Cleaned up existing test database')
  }
  
  // Create test database
  const db = new Database(DB_PATH)
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_board (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      columns_order TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `)
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_column (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kanban_board_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (kanban_board_id) REFERENCES kanban_board(id)
    )
  `)
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS kanban_card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `)
  
  console.log('Database tables created successfully')
  
  // Close the database so the server can use it
  db.close()
  
  console.log('E2E test environment ready')
}

export default globalSetup
