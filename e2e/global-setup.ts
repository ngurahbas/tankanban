import { execSync } from 'child_process'

async function globalSetup() {
  console.log('Setting up E2E test environment...')
  
  execSync('bun run e2e/setup-db.ts', { stdio: 'inherit' })
  
  console.log('\n✅ E2E test environment ready')
}

export default globalSetup
