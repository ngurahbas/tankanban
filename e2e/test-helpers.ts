import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function openSidePanel(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1400, height: 1200 })
  const menuButton = page.getByRole('button', { name: 'Toggle menu' })
  await menuButton.click()
  await page.waitForTimeout(500)
  
  await expect(page.getByText('Kanban Boards')).toBeVisible({ timeout: 3000 })
}

export async function createBoard(page: Page, boardName: string): Promise<void> {
  await openSidePanel(page)
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const addButton = buttons.find(btn => btn.textContent?.includes('Add') && btn.textContent.trim() === 'Add')
    if (addButton) {
      ;(addButton as HTMLElement).click()
    }
  })
  
  await page.waitForTimeout(300)
  
  const boardNameInput = page.getByPlaceholder('New board name')
  await boardNameInput.waitFor({ state: 'visible', timeout: 3000 })
  await boardNameInput.fill(boardName)
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const createButton = buttons.find(btn => btn.textContent?.includes('Create') && !btn.disabled)
    if (createButton) {
      ;(createButton as HTMLElement).click()
    }
  })
  
  await expect(page).toHaveURL(/\/kanban\/\d+/, { timeout: 5000 })
  await page.waitForLoadState('networkidle')
}

export async function createColumn(page: Page, columnName: string): Promise<void> {
  const addColumnButton = page.getByRole('button', { name: 'Add Column' })
  await addColumnButton.waitFor({ state: 'visible', timeout: 5000 })
  await addColumnButton.click()
  
  const columnNameInput = page.getByPlaceholder('Column name')
  await columnNameInput.waitFor({ state: 'visible', timeout: 3000 })
  await columnNameInput.fill(columnName)
  await columnNameInput.press('Enter')
  
  await page.waitForTimeout(500)
  await expect(page.locator(`text="${columnName}"`).first()).toBeVisible({ timeout: 5000 })
}

export async function createCard(page: Page, cardName: string): Promise<void> {
  const addCardButton = page.getByRole('button', { name: 'Add Card' })
  await addCardButton.waitFor({ state: 'visible', timeout: 3000 })
  await addCardButton.click()
  
  const cardNameInput = page.getByPlaceholder('Card name')
  await cardNameInput.waitFor({ state: 'visible', timeout: 3000 })
  await cardNameInput.fill(cardName)
  await cardNameInput.press('Enter')
  
  await page.waitForTimeout(500)
  await expect(page.locator(`text="${cardName}"`).first()).toBeVisible({ timeout: 5000 })
}
