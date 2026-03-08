import { test, expect } from '@playwright/test'

test.describe('Keycloak Authentication', () => {
  test('should login successfully with Keycloak', async ({ page }) => {
    page.on('console', msg => {
      if (msg.text().includes('Keycloak') || msg.text().includes('OAuth') || msg.text().includes('error')) {
        console.log('BROWSER:', msg.text())
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('callback')) {
        console.log('CALLBACK RESPONSE:', response.status(), response.url())
      }
    })
    
    await page.goto('/login')
    
    const url = await page.evaluate(async () => {
      const authModule = await import('/src/lib/auth.ts')
      return await authModule.getKeycloakAuthUrl()
    })
    
    console.log('Navigating to Keycloak...')
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    
    console.log('Filling credentials...')
    await page.locator('input[name="username"]').fill('testuser')
    await page.locator('input[name="password"]').fill('testpassword')
    
    console.log('Clicking Sign In...')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    console.log('Waiting for redirect...')
    await page.waitForURL(/localhost:3333/, { timeout: 10000 })
    
    console.log('Current URL after auth:', page.url())
    
    await expect(page).toHaveURL(/\/kanban/)
  })
})
