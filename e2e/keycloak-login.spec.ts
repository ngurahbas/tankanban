import { test, expect } from '@playwright/test'

test.describe('Keycloak Authentication', () => {
  test('should login successfully with Keycloak', async ({ page }) => {
    await page.goto('/login')
    
    const url = await page.evaluate(async () => {
      const authModule = await import('/src/lib/auth.ts')
      return await authModule.getKeycloakAuthUrl()
    })
    
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    
    await page.locator('input[name="username"]').fill('testuser')
    await page.locator('input[name="password"]').fill('testpassword')
    
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await page.waitForURL(/localhost:3333/, { timeout: 10000 })
    
    await expect(page).toHaveURL(/\/kanban/)
  })
})
