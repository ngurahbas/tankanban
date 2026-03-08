import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Configuration
 * - Uses port 3333 (different from dev port 3000)
 * - In-memory database for testing
 * - Short timeouts for fast feedback
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'APP_BASE_URL=http://localhost:3333 KEYCLOAK_BASE_URL=http://localhost:8080/realms/tankanban KEYCLOAK_CLIENT_ID=tankanban KEYCLOAK_CLIENT_SECRET=tankanban-client-secret-12345 npm run dev -- --port 3333',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },

  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
})
