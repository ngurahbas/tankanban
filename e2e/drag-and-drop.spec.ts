import { test } from '@playwright/test'
import { 
  createBoard, 
  createColumn, 
  createCard, 
  verifyInitialColumns,
  dragCardToColumn,
  dragColumnToPosition,
  expectCardInColumn,
  expectCardNotInColumn,
  expectColumnOrder
} from './test-helpers'

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kanban')
  })

  test.describe('Card Movement', () => {
    test('should move card from To Do to In Progress', async ({ page }) => {
      await createBoard(page, 'Card Movement Test')
      await verifyInitialColumns(page)
      
      const cardName = await createCard(page, 'Task to Move')
      
      await expectCardInColumn(page, cardName, 'To Do')
      
      await dragCardToColumn(page, cardName, 'In Progress')
      
      await expectCardNotInColumn(page, cardName, 'To Do')
      await expectCardInColumn(page, cardName, 'In Progress')
    })

    test('should move card from In Progress to Done', async ({ page }) => {
      await createBoard(page, 'Card to Done Test')
      await verifyInitialColumns(page)
      
      const cardName = await createCard(page, 'Complete Task')
      
      await dragCardToColumn(page, cardName, 'In Progress')
      await expectCardInColumn(page, cardName, 'In Progress')
      
      await dragCardToColumn(page, cardName, 'Done')
      
      await expectCardNotInColumn(page, cardName, 'In Progress')
      await expectCardInColumn(page, cardName, 'Done')
    })

    test('should move card to empty column', async ({ page }) => {
      await createBoard(page, 'Empty Column Test')
      await verifyInitialColumns(page)
      
      const columnName = await createColumn(page, 'Review')
      
      const cardName = await createCard(page, 'Review Task')
      await expectCardInColumn(page, cardName, 'To Do')
      
      await dragCardToColumn(page, cardName, columnName)
      
      await expectCardNotInColumn(page, cardName, 'To Do')
      await expectCardInColumn(page, cardName, columnName)
    })

    test('should persist card movement after page reload', async ({ page }) => {
      await createBoard(page, 'Persistence Test')
      await verifyInitialColumns(page)
      
      const cardName = await createCard(page, 'Persistent Task')
      await dragCardToColumn(page, cardName, 'In Progress')
      await expectCardInColumn(page, cardName, 'In Progress')
      
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      await expectCardInColumn(page, cardName, 'In Progress')
      await expectCardNotInColumn(page, cardName, 'To Do')
    })

    test('should move multiple cards to different columns', async ({ page }) => {
      await createBoard(page, 'Multiple Cards Test')
      await verifyInitialColumns(page)
      
      const card1 = await createCard(page, 'Card 1')
      const card2 = await createCard(page, 'Card 2')
      const card3 = await createCard(page, 'Card 3')
      
      await dragCardToColumn(page, card1, 'In Progress')
      await dragCardToColumn(page, card2, 'Done')
      
      await expectCardInColumn(page, card1, 'In Progress')
      await expectCardInColumn(page, card2, 'Done')
      await expectCardInColumn(page, card3, 'To Do')
    })
  })

  test.describe('Column Reordering', () => {
    test('should reorder columns - move first to last', async ({ page }) => {
      await createBoard(page, 'Column Order Test')
      await verifyInitialColumns(page)
      
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done'])
      
      await dragColumnToPosition(page, 'To Do', 'Done')
      
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
    })

    test('should reorder columns - move last to first', async ({ page }) => {
      await createBoard(page, 'Column Order Test 2')
      await verifyInitialColumns(page)
      
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done'])
      
      await dragColumnToPosition(page, 'Done', 'To Do')
      
      await expectColumnOrder(page, ['Done', 'To Do', 'In Progress'])
    })

    test('should reorder columns - swap middle columns', async ({ page }) => {
      await createBoard(page, 'Column Order Test 3')
      await verifyInitialColumns(page)
      
      const columnName = await createColumn(page, 'Review')
      
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done', columnName])
      
      await dragColumnToPosition(page, 'In Progress', 'To Do')
      
      await expectColumnOrder(page, ['In Progress', 'To Do', 'Done', columnName])
    })

    test('should persist column order after page reload', async ({ page }) => {
      await createBoard(page, 'Column Persistence Test')
      await verifyInitialColumns(page)
      
      await dragColumnToPosition(page, 'To Do', 'Done')
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
      
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
    })

    test('should allow dragging column with cards inside', async ({ page }) => {
      await createBoard(page, 'Column With Cards Test')
      await verifyInitialColumns(page)
      
      const cardName = await createCard(page, 'Task in Column')
      await expectCardInColumn(page, cardName, 'To Do')
      
      await dragColumnToPosition(page, 'To Do', 'Done')
      
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
      
      await expectCardInColumn(page, cardName, 'To Do')
    })
  })
})
