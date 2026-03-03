import { existsSync, unlinkSync } from 'fs'

const DB_PATH = 'e2e-test.db'

async function globalTeardown() {
  console.log('Cleaning up E2E test environment...')
  
  // Clean up test database file
  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH)
    console.log('Test database file removed')
  }
  
  console.log('E2E test environment cleaned up')
}

export default globalTeardown
