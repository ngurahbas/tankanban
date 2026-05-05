import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate with Keycloak', async ({ page }) => {
  await page.goto('/kanban')
  
  await page.getByRole('button', { name: 'Continue with Keycloak' }).click()
  
  await expect(page.locator('#username')).toBeVisible()
  await page.locator('#username').fill('testuser')
  await page.locator('#password').fill('testpassword')
  await page.locator('#kc-login').click()
  
  await expect(page).toHaveURL(/\/kanban$/)
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible()
  
  await page.context().storageState({ path: authFile })
})
