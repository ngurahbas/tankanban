import { test, expect } from '@playwright/test'

test.describe('Kanban Board View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
  })

  test('should create a new board and navigate to it', async ({ page }) => {
    await page.click('button:has-text("Create New Board")')
    
    await page.waitForSelector('text=Kanban Boards')
    
    await page.click('button:has-text("Add")')
    await page.fill('input[placeholder="New board name"]', 'Test Board')
    await page.click('button:has-text("Create")')
    
    await page.waitForSelector('button:has-text("Test Board")')
    
    await page.click('button:has-text("Test Board")')
    
    await expect(page).toHaveURL(/\/kanban\/\d+/)
    await expect(page.locator('text=Test Board')).toBeVisible()
  })

  test('should add columns to a board', async ({ page }) => {
    await page.click('button:has-text("Create New Board")')
    await page.waitForSelector('text=Kanban Boards')
    await page.click('button:has-text("Add")')
    await page.fill('input[placeholder="New board name"]', 'Board with Columns')
    await page.click('button:has-text("Create")')
    await page.waitForSelector('button:has-text("Board with Columns")')
    await page.click('button:has-text("Board with Columns")')
    
    await page.click('button:has-text("Add Column")')
    await page.fill('input[placeholder="Column name"]', 'To Do')
    await page.click('button:has-text("Add")')
    
    await expect(page.locator('text=To Do')).toBeVisible()
    
    await page.click('button:has-text("Add Column")')
    await page.fill('input[placeholder="Column name"]', 'In Progress')
    await page.click('button:has-text("Add")')
    
    await expect(page.locator('text=In Progress')).toBeVisible()
  })

  test('should add cards to a column', async ({ page }) => {
    await page.click('button:has-text("Create New Board")')
    await page.waitForSelector('text=Kanban Boards')
    await page.click('button:has-text("Add")')
    await page.fill('input[placeholder="New board name"]', 'Board with Cards')
    await page.click('button:has-text("Create")')
    await page.waitForSelector('button:has-text("Board with Cards")')
    await page.click('button:has-text("Board with Cards")')
    
    await page.click('button:has-text("Add Column")')
    await page.fill('input[placeholder="Column name"]', 'Tasks')
    await page.click('button:has-text("Add")')
    
    await page.click('button:has-text("Add Card")')
    await page.fill('input[placeholder="Card name"]', 'First Task')
    await page.click('button:has-text("Add")')
    
    await expect(page.locator('text=First Task')).toBeVisible()
  })

  test('should edit board title inline', async ({ page }) => {
    await page.click('button:has-text("Create New Board")')
    await page.waitForSelector('text=Kanban Boards')
    await page.click('button:has-text("Add")')
    await page.fill('input[placeholder="New board name"]', 'Editable Board')
    await page.click('button:has-text("Create")')
    await page.waitForSelector('button:has-text("Editable Board")')
    await page.click('button:has-text("Editable Board")')
    
    await page.click('text=Editable Board')
    await page.fill('input', 'Updated Board Name')
    await page.press('input', 'Enter')
    
    await expect(page.locator('text=Updated Board Name')).toBeVisible()
  })

  test('should edit card description', async ({ page }) => {
    await page.click('button:has-text("Create New Board")')
    await page.waitForSelector('text=Kanban Boards')
    await page.click('button:has-text("Add")')
    await page.fill('input[placeholder="New board name"]', 'Board for Card Description')
    await page.click('button:has-text("Create")')
    await page.waitForSelector('button:has-text("Board for Card Description")')
    await page.click('button:has-text("Board for Card Description")')
    
    await page.click('button:has-text("Add Column")')
    await page.fill('input[placeholder="Column name"]', 'Column')
    await page.click('button:has-text("Add")')
    
    await page.click('button:has-text("Add Card")')
    await page.fill('input[placeholder="Card name"]', 'Card with Description')
    await page.click('button:has-text("Add")')
    
    await page.click('text=Add description...')
    await page.fill('textarea', 'This is a detailed description')
    await page.press('textarea', 'Escape')
    
    await expect(page.locator('text=This is a detailed description')).toBeVisible()
  })
})
