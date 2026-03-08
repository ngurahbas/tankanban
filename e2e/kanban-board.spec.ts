import { test, expect } from '@playwright/test'
import { createBoard, createColumn, verifyInitialColumns } from './test-helpers'

test.describe('Kanban Board View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
  })

  test('should create a new board and navigate to it', async ({ page }) => {
    const boardName = await createBoard(page, 'Test Board')
    
    await expect(page.getByRole('button', { name: boardName })).toBeVisible()
    await verifyInitialColumns(page)
  })

  test('should add additional columns to a board', async ({ page }) => {
    await createBoard(page, 'Board with Columns')
    
    await verifyInitialColumns(page)
    
    await createColumn(page, 'Review')
    await createColumn(page, 'Testing')
    
    const addCardButtons = page.getByRole('button', { name: 'Add Card' })
    await expect(addCardButtons).toHaveCount(5)
  })

  test('should add cards to a default column', async ({ page }) => {
    await createBoard(page, 'Board with Cards')
    
    await verifyInitialColumns(page)
    
    const addCardButton = page.getByRole('button', { name: 'Add Card' }).first()
    await addCardButton.click()
    
    const cardNameInput = page.getByPlaceholder('Card name')
    await cardNameInput.waitFor({ state: 'visible', timeout: 3000 })
    await cardNameInput.fill('First Task')
    await cardNameInput.press('Enter')
    
    await page.waitForTimeout(500)
    await expect(page.locator('text="First Task"').first()).toBeVisible({ timeout: 5000 })
  })

  test('should edit board title inline', async ({ page }) => {
    const boardName = await createBoard(page, 'Editable Board')
    
    const boardTitle = page.getByRole('button', { name: boardName })
    await boardTitle.click()
    
    const input = page.getByRole('textbox')
    await input.fill('Updated Board Name')
    await input.press('Enter')
    
    await expect(page.getByRole('button', { name: 'Updated Board Name' })).toBeVisible()
  })

  test('should edit card description', async ({ page }) => {
    await createBoard(page, 'Board for Card Description')
    
    await verifyInitialColumns(page)
    
    const addCardButton = page.getByRole('button', { name: 'Add Card' }).first()
    await addCardButton.click()
    
    const cardNameInput = page.getByPlaceholder('Card name')
    await cardNameInput.waitFor({ state: 'visible', timeout: 3000 })
    await cardNameInput.fill('Card with Description')
    await cardNameInput.press('Enter')
    
    await page.waitForTimeout(500)
    
    const addDescriptionPlaceholder = page.getByText('Add description...')
    await addDescriptionPlaceholder.click()
    
    const textarea = page.getByRole('textbox')
    await textarea.fill('This is a detailed description')
    await textarea.blur()
    
    await expect(page.getByText('This is a detailed description')).toBeVisible()
  })
})
