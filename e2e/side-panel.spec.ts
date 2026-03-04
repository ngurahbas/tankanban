import { test, expect } from '@playwright/test'
import { openSidePanel } from './test-helpers'

test.describe('Side Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
    await expect(page.getByRole('heading', { name: 'Welcome to Kanban' })).toBeVisible()
  })

  test('should create a new board via side panel', async ({ page }) => {
    await openSidePanel(page)
    
    await expect(page.getByText('No boards yet')).toBeVisible()
    
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent?.includes('Add') && !button.disabled) {
          button.click()
          break
        }
      }
    })
    
    const boardName = 'Test Board'
    const boardNameInput = page.getByPlaceholder('New board name')
    await boardNameInput.fill(boardName)
    
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent?.includes('Create') && !button.disabled) {
          button.click()
          break
        }
      }
    })
    
    await expect(page.getByRole('button', { name: boardName })).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('No boards yet')).not.toBeVisible()
  })
})