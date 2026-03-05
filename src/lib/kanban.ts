import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index.ts'
import { kanbanBoard, kanbanColumn, kanbanCard } from '../db/schema.ts'
import { desc, eq } from 'drizzle-orm'

export const getBoards = createServerFn({ method: 'GET' }).handler(async () => {
  const boards = await db
    .select()
    .from(kanbanBoard)
    .orderBy(desc(kanbanBoard.createdAt))
  
  return boards
})

export const createBoard = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async (ctx) => {
    const [board] = await db
      .insert(kanbanBoard)
      .values({
        name: ctx.data,
        columnsOrder: '',
      })
      .returning()

    const defaultColumns = ['To Do', 'In Progress', 'Done']
    const columns = await Promise.all(
      defaultColumns.map(name =>
        db
          .insert(kanbanColumn)
          .values({
            kanbanBoardId: board.id,
            name,
          })
          .returning()
      )
    )

    const columnIds = columns.map(([col]) => col.id).join(',')
    const [updatedBoard] = await db
      .update(kanbanBoard)
      .set({ columnsOrder: columnIds })
      .where(eq(kanbanBoard.id, board.id))
      .returning()

    return updatedBoard
  })

export const getBoard = createServerFn({ method: 'GET' })
  .inputValidator((data: number) => data)
  .handler(async (ctx) => {
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, ctx.data))
    
    if (!board) {
      throw new Error('Board not found')
    }

    const columns = await db
      .select()
      .from(kanbanColumn)
      .where(eq(kanbanColumn.kanbanBoardId, ctx.data))

    const columnsOrder = board.columnsOrder
      ? board.columnsOrder.split(',').map(Number)
      : []
    
    const sortedColumns = columnsOrder.length > 0
      ? [
          ...columnsOrder
            .map(id => columns.find(c => c.id === id))
            .filter((c): c is typeof columns[0] => c !== undefined),
          ...columns.filter(c => !columnsOrder.includes(c.id)),
        ]
      : columns

    const cards = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.kanbanBoardId, ctx.data))
      .orderBy(desc(kanbanCard.createdAt))

    return { ...board, columns: sortedColumns, cards }
  })

export const updateBoard = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; name: string; columnsOrder?: string }) => data)
  .handler(async (ctx) => {
    const [board] = await db
      .update(kanbanBoard)
      .set({
        name: ctx.data.name,
        columnsOrder: ctx.data.columnsOrder,
        updatedAt: new Date(),
      })
      .where(eq(kanbanBoard.id, ctx.data.id))
      .returning()

    return board
  })

export const createColumn = createServerFn({ method: 'POST' })
  .inputValidator((data: { boardId: number; name: string }) => data)
  .handler(async (ctx) => {
    const [column] = await db
      .insert(kanbanColumn)
      .values({
        kanbanBoardId: ctx.data.boardId,
        name: ctx.data.name,
      })
      .returning()

    return column
  })

export const updateColumn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; name: string }) => data)
  .handler(async (ctx) => {
    const [column] = await db
      .update(kanbanColumn)
      .set({
        name: ctx.data.name,
        updatedAt: new Date(),
      })
      .where(eq(kanbanColumn.id, ctx.data.id))
      .returning()

    return column
  })

export const deleteColumn = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async (ctx) => {
    await db.delete(kanbanCard).where(eq(kanbanCard.kanbanColumnId, ctx.data))
    await db.delete(kanbanColumn).where(eq(kanbanColumn.id, ctx.data))
    return { success: true }
  })

export const createCard = createServerFn({ method: 'POST' })
  .inputValidator((data: { columnId: number; boardId: number; name: string; description?: string }) => data)
  .handler(async (ctx) => {
    const [card] = await db
      .insert(kanbanCard)
      .values({
        kanbanBoardId: ctx.data.boardId,
        kanbanColumnId: ctx.data.columnId,
        name: ctx.data.name,
        description: ctx.data.description || null,
      })
      .returning()

    return card
  })

export const updateCard = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; name?: string; description?: string }) => data)
  .handler(async (ctx) => {
    const [card] = await db
      .update(kanbanCard)
      .set({
        name: ctx.data.name,
        description: ctx.data.description,
        updatedAt: new Date(),
      })
      .where(eq(kanbanCard.id, ctx.data.id))
      .returning()

    return card
  })

export const deleteCard = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async (ctx) => {
    await db.delete(kanbanCard).where(eq(kanbanCard.id, ctx.data))
    return { success: true }
  })

export const moveCard = createServerFn({ method: 'POST' })
  .inputValidator((data: { cardId: number; targetColumnId: number }) => data)
  .handler(async (ctx) => {
    const [card] = await db
      .update(kanbanCard)
      .set({
        kanbanColumnId: ctx.data.targetColumnId,
        updatedAt: new Date(),
      })
      .where(eq(kanbanCard.id, ctx.data.cardId))
      .returning()

    return card
  })
