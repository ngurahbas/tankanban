import { test, expect } from '@playwright/test'
import { createBoard, unlockLayout } from './test-helpers'

test.describe('New Column Hint', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
  })

  test('should show hint tooltip after adding a new column', async ({ page }) => {
    // Create a board
    await createBoard(page, 'Hint Test Board')
    
    // Unlock layout to show Add Column button
    await unlockLayout(page)
    
    // Add a new column
    const addColumnButton = page.getByRole('button', { name: 'Add Column' })
    await addColumnButton.waitFor({ state: 'visible', timeout: 5000 })
    await addColumnButton.click()
    
    // Fill in column name and submit
    const columnNameInput = page.getByPlaceholder('Column name')
    await columnNameInput.waitFor({ state: 'visible', timeout: 3000 })
    await columnNameInput.fill('TestColumn')
    await columnNameInput.press('Enter')
    
    // Wait for the column to appear
    await expect(page.locator('text="TestColumn"').first()).toBeVisible({ timeout: 5000 })
    
    // Wait 500ms for the hint to transition from entering (opacity-0) to visible (opacity-100)
    // The entering phase is 300ms, so we wait a bit longer to ensure it's fully visible
    await page.waitForTimeout(500)
    
    // Now check the hint is visible
    const hintElement = page.getByText('Drag handle to move').first()
    await expect(hintElement).toBeVisible({ timeout: 1000 })
    
    // Take screenshot of the column with hint
    const testColumn = page.locator('[class*="flex-shrink-0"]').filter({ hasText: 'TestColumn' })
    await testColumn.screenshot({ path: 'test-results/hint-column.png' })
    
    // Take full page screenshot
    await page.screenshot({ path: 'test-results/hint-full.png', fullPage: true })
  })
})