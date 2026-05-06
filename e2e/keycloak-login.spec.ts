import { test, expect } from '@playwright/test'

test.describe('Keycloak Authentication', () => {
  test('should login successfully with Keycloak', async ({ page }) => {
    await page.goto('/kanban')

    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Continue with Keycloak' }).click()

    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('#username')).toBeVisible()
    await page.locator('#username').fill('testuser')
    await page.locator('#password').fill('testpassword')
    await page.locator('#kc-login').click()
    
    await expect(page).toHaveURL(/\/kanban$/)
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible()
  })
})
