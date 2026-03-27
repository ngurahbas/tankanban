import { defineConfig, devices } from '@playwright/test'
import { CI } from './src/config.ts'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: 'list',
  
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/keycloak-login.spec.ts'],
    },
    {
      name: 'auth-tests',
      testMatch: ['**/keycloak-login.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'APP_BASE_URL=http://localhost:3333 KEYCLOAK_BASE_URL=http://localhost:8080/realms/tankanban KEYCLOAK_CLIENT_ID=tankanban KEYCLOAK_CLIENT_SECRET=tankanban-client-secret-12345 bun run dev -- --port 3333',
    url: 'http://localhost:3333',
    reuseExistingServer: !CI,
    timeout: 30000,
  },

  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
})
