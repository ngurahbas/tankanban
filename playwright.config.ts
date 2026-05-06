import { defineConfig, devices } from '@playwright/test'

const CI = process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 5000,
    navigationTimeout: 5000,
    launchOptions: {
      slowMo: process.env.PLAYWRIGHT_SLOW_MO ? parseInt(process.env.PLAYWRIGHT_SLOW_MO, 10) : undefined,
    },
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
})
