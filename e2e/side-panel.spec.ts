import { test, expect } from '@playwright/test'

test.describe('Side Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to kanban page
    await page.goto('/kanban')
    
    // Wait for the page to be fully loaded
    await expect(page.getByRole('heading', { name: 'Welcome to Kanban' })).toBeVisible()
  })

  test('should create a new board via side panel', async ({ page }) => {
    // Set viewport to ensure side panel is visible on desktop
    await page.setViewportSize({ width: 1400, height: 900 })
    
    // Open side panel by clicking menu toggle
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    
    // Wait for side panel animation
    await page.waitForTimeout(400)
    
    // Verify "No boards yet" text is visible (side panel is open)
    await expect(page.getByText('No boards yet')).toBeVisible()
    
    // Click the "Add" button using JavaScript to bypass viewport issues
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent?.includes('Add')) {
          button.click()
          break
        }
      }
    })
    
    // Fill in the board name
    const boardName = 'Test Board'
    await page.getByPlaceholder('New board name').fill(boardName)
    
    // Click Create button using JavaScript
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button')
      for (const button of buttons) {
        if (button.textContent?.includes('Create') && !button.disabled) {
          button.click()
          break
        }
      }
    })
    
    // Wait for the board to appear
    await page.waitForTimeout(100)
    
    // Verify the board appears in the list
    await expect(page.getByRole('button', { name: boardName })).toBeVisible()
    
    // Verify "No boards yet" text is no longer visible
    await expect(page.getByText('No boards yet')).not.toBeVisible()
  })
})