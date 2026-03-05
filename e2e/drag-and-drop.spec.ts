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
      
      // Create a card in To Do
      await createCard(page, 'Task to Move')
      
      // Verify card is in To Do
      await expectCardInColumn(page, 'Task to Move', 'To Do')
      
      // Drag card to In Progress
      await dragCardToColumn(page, 'Task to Move', 'In Progress')
      
      // Verify card moved
      await expectCardNotInColumn(page, 'Task to Move', 'To Do')
      await expectCardInColumn(page, 'Task to Move', 'In Progress')
    })

    test('should move card from In Progress to Done', async ({ page }) => {
      await createBoard(page, 'Card to Done Test')
      await verifyInitialColumns(page)
      
      // Create a card first
      await createCard(page, 'Complete Task')
      
      // Move to In Progress first
      await dragCardToColumn(page, 'Complete Task', 'In Progress')
      await expectCardInColumn(page, 'Complete Task', 'In Progress')
      
      // Now move to Done
      await dragCardToColumn(page, 'Complete Task', 'Done')
      
      // Verify final position
      await expectCardNotInColumn(page, 'Complete Task', 'In Progress')
      await expectCardInColumn(page, 'Complete Task', 'Done')
    })

    test('should move card to empty column', async ({ page }) => {
      await createBoard(page, 'Empty Column Test')
      await verifyInitialColumns(page)
      
      // Create a new empty column
      await createColumn(page, 'Review')
      
      // Create a card in To Do
      await createCard(page, 'Review Task')
      await expectCardInColumn(page, 'Review Task', 'To Do')
      
      // Move to empty Review column
      await dragCardToColumn(page, 'Review Task', 'Review')
      
      // Verify moved to Review
      await expectCardNotInColumn(page, 'Review Task', 'To Do')
      await expectCardInColumn(page, 'Review Task', 'Review')
    })

    test('should persist card movement after page reload', async ({ page }) => {
      await createBoard(page, 'Persistence Test')
      await verifyInitialColumns(page)
      
      // Create and move card
      await createCard(page, 'Persistent Task')
      await dragCardToColumn(page, 'Persistent Task', 'In Progress')
      await expectCardInColumn(page, 'Persistent Task', 'In Progress')
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verify card still in In Progress
      await expectCardInColumn(page, 'Persistent Task', 'In Progress')
      await expectCardNotInColumn(page, 'Persistent Task', 'To Do')
    })

    test('should move multiple cards to different columns', async ({ page }) => {
      await createBoard(page, 'Multiple Cards Test')
      await verifyInitialColumns(page)
      
      // Create multiple cards
      await createCard(page, 'Card 1')
      await createCard(page, 'Card 2')
      await createCard(page, 'Card 3')
      
      // Move cards to different columns
      await dragCardToColumn(page, 'Card 1', 'In Progress')
      await dragCardToColumn(page, 'Card 2', 'Done')
      
      // Verify positions
      await expectCardInColumn(page, 'Card 1', 'In Progress')
      await expectCardInColumn(page, 'Card 2', 'Done')
      await expectCardInColumn(page, 'Card 3', 'To Do')
    })
  })

  test.describe('Column Reordering', () => {
    test('should reorder columns - move first to last', async ({ page }) => {
      await createBoard(page, 'Column Order Test')
      await verifyInitialColumns(page)
      
      // Initial order: To Do, In Progress, Done
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done'])
      
      // Drag To Do to after Done (last position)
      await dragColumnToPosition(page, 'To Do', 'Done')
      
      // New order should be: In Progress, Done, To Do
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
    })

    test('should reorder columns - move last to first', async ({ page }) => {
      await createBoard(page, 'Column Order Test 2')
      await verifyInitialColumns(page)
      
      // Initial order: To Do, In Progress, Done
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done'])
      
      // Drag Done to before To Do (first position)
      await dragColumnToPosition(page, 'Done', 'To Do')
      
      // New order should be: Done, To Do, In Progress
      await expectColumnOrder(page, ['Done', 'To Do', 'In Progress'])
    })

    test('should reorder columns - swap middle columns', async ({ page }) => {
      await createBoard(page, 'Column Order Test 3')
      await verifyInitialColumns(page)
      
      // Add another column to make it more interesting
      await createColumn(page, 'Review')
      
      // Initial order: To Do, In Progress, Done, Review
      await expectColumnOrder(page, ['To Do', 'In Progress', 'Done', 'Review'])
      
      // Drag In Progress to before To Do
      await dragColumnToPosition(page, 'In Progress', 'To Do')
      
      // New order should be: In Progress, To Do, Done, Review
      await expectColumnOrder(page, ['In Progress', 'To Do', 'Done', 'Review'])
    })

    test('should persist column order after page reload', async ({ page }) => {
      await createBoard(page, 'Column Persistence Test')
      await verifyInitialColumns(page)
      
      // Reorder columns
      await dragColumnToPosition(page, 'To Do', 'Done')
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Verify order persisted
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
    })

    test('should allow dragging column with cards inside', async ({ page }) => {
      await createBoard(page, 'Column With Cards Test')
      await verifyInitialColumns(page)
      
      // Create a card in To Do
      await createCard(page, 'Task in Column')
      await expectCardInColumn(page, 'Task in Column', 'To Do')
      
      // Drag To Do column to last position
      await dragColumnToPosition(page, 'To Do', 'Done')
      
      // Verify column order changed
      await expectColumnOrder(page, ['In Progress', 'Done', 'To Do'])
      
      // Verify card is still in the column
      await expectCardInColumn(page, 'Task in Column', 'To Do')
    })
  })
})
