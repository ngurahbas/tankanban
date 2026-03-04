import { test, expect } from '@playwright/test'
import { createBoard, createColumn, createCard } from './test-helpers'

test.describe('Kanban Board View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
  })

  test('should create a new board and navigate to it', async ({ page }) => {
    await createBoard(page, 'Test Board')
    
    await expect(page.getByRole('button', { name: 'Test Board' })).toBeVisible()
  })

  test('should add columns to a board', async ({ page }) => {
    await createBoard(page, 'Board with Columns')
    
    await createColumn(page, 'To Do')
    await createColumn(page, 'In Progress')
  })

  test('should add cards to a column', async ({ page }) => {
    await createBoard(page, 'Board with Cards')
    await createColumn(page, 'Tasks')
    await createCard(page, 'First Task')
  })

  test('should edit board title inline', async ({ page }) => {
    await createBoard(page, 'Editable Board')
    
    const boardTitle = page.getByRole('button', { name: 'Editable Board' })
    await boardTitle.click()
    
    const input = page.getByRole('textbox')
    await input.fill('Updated Board Name')
    await input.press('Enter')
    
    await expect(page.getByRole('button', { name: 'Updated Board Name' })).toBeVisible()
  })

  test('should edit card description', async ({ page }) => {
    await createBoard(page, 'Board for Card Description')
    await createColumn(page, 'Column')
    await createCard(page, 'Card with Description')
    
    const addDescriptionPlaceholder = page.getByText('Add description...')
    await addDescriptionPlaceholder.click()
    
    const textarea = page.getByRole('textbox')
    await textarea.fill('This is a detailed description')
    await textarea.blur()
    
    await expect(page.getByText('This is a detailed description')).toBeVisible()
  })
})
