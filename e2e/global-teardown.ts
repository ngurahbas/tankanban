async function globalTeardown() {
  console.log('Cleaning up E2E test environment...')
  
  // Note: We don't delete dev.db as it's used for development
  // Tables will be recreated on next test run
  
  console.log('E2E test environment cleaned up')
}

export default globalTeardown
