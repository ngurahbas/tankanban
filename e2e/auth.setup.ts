import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate with Keycloak', async ({ page }) => {
  await page.goto('/kanban')
  
  await page.waitForLoadState('networkidle')
  
  await page.getByRole('button', { name: 'Continue with Keycloak' }).click()
  
  await page.waitForLoadState('networkidle')
  
  await expect(page.locator('#username')).toBeVisible({ timeout: 5000 })
  await page.locator('#username').fill('testuser')
  await page.locator('#password').fill('testpassword')
  
  await page.locator('#kc-login').click()
  
  await page.waitForURL('**/kanban', { timeout: 10000 })
  
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible()
  
  await page.context().storageState({ path: authFile })
})
