import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

function uniqueName(name: string): string {
  return `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function unlockLayout(page: Page): Promise<void> {
  // First check if already unlocked by looking for the unlock button
  const unlockButton = page.getByRole('button', { name: /Unlocked/ })
  const isAlreadyUnlocked = await unlockButton.isVisible().catch(() => false)
  
  if (isAlreadyUnlocked) {
    return
  }
  
  // Click the lock button to unlock
  const lockButton = page.getByRole('button', { name: /Locked/ })
  await lockButton.waitFor({ state: 'visible', timeout: 5000 })
  await lockButton.click()
  
  // Wait for unlock state
  await unlockButton.waitFor({ state: 'visible', timeout: 5000 })
  await page.waitForTimeout(300)
}

export async function openSidePanel(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1400, height: 1200 })
  const menuButton = page.getByRole('button', { name: 'Toggle menu' })
  await menuButton.waitFor({ state: 'visible', timeout: 10000 })
  await menuButton.click()
  await page.waitForTimeout(500)
  
  await expect(page.getByText('Kanban Boards')).toBeVisible({ timeout: 10000 })
}

export async function createBoard(page: Page, boardName: string): Promise<string> {
  const uniqueBoardName = uniqueName(boardName)
  await openSidePanel(page)
  
  await page.waitForTimeout(500)
  
  const addButton = page.locator('button').filter({ hasText: /^Add$/ })
  await addButton.waitFor({ state: 'attached', timeout: 5000 })
  await addButton.dispatchEvent('click')
  
  await page.waitForTimeout(300)
  
  const boardNameInput = page.getByPlaceholder('New board name')
  await boardNameInput.waitFor({ state: 'visible', timeout: 5000 })
  await boardNameInput.fill(uniqueBoardName)
  
  const createButton = page.locator('button').filter({ hasText: 'Create' })
  await createButton.waitFor({ state: 'attached', timeout: 5000 })
  await createButton.dispatchEvent('click')
  
  await expect(page).toHaveURL(/\/kanban\/\d+/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')
  
  return uniqueBoardName
}

export async function createColumn(page: Page, columnName: string): Promise<string> {
  const uniqueColumnName = uniqueName(columnName)
  
  // Unlock layout first to show Add Column button
  await unlockLayout(page)
  
  const addColumnButton = page.getByRole('button', { name: 'Add Column' })
  await addColumnButton.waitFor({ state: 'visible', timeout: 5000 })
  await addColumnButton.click()
  
  const columnNameInput = page.getByPlaceholder('Column name')
  await columnNameInput.waitFor({ state: 'visible', timeout: 3000 })
  await columnNameInput.fill(uniqueColumnName)
  await columnNameInput.press('Enter')
  
  await page.waitForTimeout(500)
  await expect(page.locator(`text="${uniqueColumnName}"`).first()).toBeVisible({ timeout: 5000 })
  
  return uniqueColumnName
}

export async function createCard(page: Page, cardName: string): Promise<string> {
  const uniqueCardName = uniqueName(cardName)
  const addCardButton = page.getByRole('button', { name: 'Add Card' }).first()
  await addCardButton.waitFor({ state: 'visible', timeout: 3000 })
  await addCardButton.click()
  
  const cardNameInput = page.getByPlaceholder('Card name')
  await cardNameInput.waitFor({ state: 'visible', timeout: 3000 })
  await cardNameInput.fill(uniqueCardName)
  await cardNameInput.press('Enter')
  
  await page.waitForTimeout(500)
  await expect(page.locator(`text="${uniqueCardName}"`).first()).toBeVisible({ timeout: 5000 })
  
  return uniqueCardName
}

export async function verifyInitialColumns(page: Page): Promise<void> {
  // Use more specific selector - column headers are within flex-shrink-0 columns
  const columns = page.locator('[class*="flex-shrink-0"]')
  await expect(columns.filter({ hasText: 'To Do' })).toBeVisible({ timeout: 5000 })
  await expect(columns.filter({ hasText: 'In Progress' })).toBeVisible()
  await expect(columns.filter({ hasText: 'Done' })).toBeVisible()
  
  const addCardButtons = page.getByRole('button', { name: 'Add Card' })
  await expect(addCardButtons).toHaveCount(3)
}

// Drag and Drop Helpers

export async function getCardByName(page: Page, cardName: string) {
  return page.locator('text=' + cardName).locator('..').locator('..').filter({ has: page.locator('[aria-label="Drag handle"]') })
}

export async function getCardDragHandle(page: Page, cardName: string) {
  // Find the card by name, then find its drag handle
  // Cards are inside columns, so filter by the card container first
  const column = page.locator('[class*="flex-shrink-0"]').filter({ hasText: cardName })
  // Get the drag handle specifically from the card (not the column header)
  const cardHandle = column.locator('[class*="rounded-lg border"]').filter({ hasText: cardName }).locator('[aria-label="Drag handle"]')
  return cardHandle
}

export async function getColumnByName(page: Page, columnName: string) {
  // Find column by looking for the header with exact text match, then get parent column
  const allColumns = page.locator('[class*="flex-shrink-0"]')
  const count = await allColumns.count()
  
  for (let i = 0; i < count; i++) {
    const column = allColumns.nth(i)
    const header = column.locator('[class*="font-semibold"]').first()
    const headerText = await header.textContent().catch(() => null)
    if (headerText === columnName) {
      return column
    }
  }
  
  throw new Error(`Column "${columnName}" not found`)
}

export async function getColumnDragHandle(page: Page, columnName: string) {
  const column = await getColumnByName(page, columnName)
  return column.locator('[aria-label="Drag handle"]').first()
}

export async function dragCardToColumn(page: Page, cardName: string, targetColumnName: string) {
  const handle = await getCardDragHandle(page, cardName)
  const targetColumn = await getColumnByName(page, targetColumnName)
  
  // Perform drag using mouse events for better compatibility with @dnd-kit
  await handle.scrollIntoViewIfNeeded()
  const handleBox = await handle.boundingBox()
  const targetBox = await targetColumn.boundingBox()
  
  if (!handleBox || !targetBox) {
    throw new Error('Could not find drag handle or target column')
  }
  
  // Move to handle and press down
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  
  // Small delay to trigger drag start
  await page.waitForTimeout(100)
  
  // Move to target (center of column)
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 })
  
  // Small delay before release
  await page.waitForTimeout(100)
  
  await page.mouse.up()
  
  // Wait for state to settle
  await page.waitForTimeout(500)
}

export async function dragColumnToPosition(page: Page, columnName: string, targetColumnName: string) {
  // Unlock layout first to show drag handles
  await unlockLayout(page)
  
  const handle = await getColumnDragHandle(page, columnName)
  const targetColumn = await getColumnByName(page, targetColumnName)
  
  await handle.scrollIntoViewIfNeeded()
  const handleBox = await handle.boundingBox()
  const targetBox = await targetColumn.boundingBox()
  
  if (!handleBox || !targetBox) {
    throw new Error('Could not find column drag handle or target column')
  }
  
  // Move to handle and press down
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  
  // Small delay to trigger drag start
  await page.waitForTimeout(100)
  
  // Move to target column position (slightly offset to indicate position)
  await page.mouse.move(targetBox.x + targetBox.width / 2 + 50, targetBox.y + 50, { steps: 10 })
  
  // Small delay before release
  await page.waitForTimeout(100)
  
  await page.mouse.up()
  
  // Wait for state to settle
  await page.waitForTimeout(500)
}

export async function expectCardInColumn(page: Page, cardName: string, columnName: string) {
  const column = await getColumnByName(page, columnName)
  const card = column.locator('text=' + cardName)
  await expect(card).toBeVisible()
}

export async function expectCardNotInColumn(page: Page, cardName: string, columnName: string) {
  const column = await getColumnByName(page, columnName)
  const card = column.locator('text=' + cardName)
  await expect(card).not.toBeVisible()
}

export async function getColumnOrder(page: Page): Promise<string[]> {
  const headers = page.locator('[class*="flex-shrink-0"] [class*="font-semibold"]')
  return headers.allTextContents()
}

export async function expectColumnOrder(page: Page, expectedOrder: string[]) {
  const actualOrder = await getColumnOrder(page)
  expect(actualOrder).toEqual(expectedOrder)
}
