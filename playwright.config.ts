import { defineConfig, devices } from '@playwright/test'

const CI = process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 5000,
    navigationTimeout: 5000,
    video: process.env.PLAYWRIGHT_VIDEO
      ? { mode: process.env.PLAYWRIGHT_VIDEO as 'on' | 'retain-on-failure' | 'on-first-retry', size: { width: 1920, height: 1080 } }
      : 'off',
    launchOptions: {
      slowMo: process.env.PLAYWRIGHT_SLOW_MO ? parseInt(process.env.PLAYWRIGHT_SLOW_MO, 10) : undefined,
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup']
    },
  ],
})
