import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index.ts'
import { kanbanBoard, kanbanColumn, kanbanCard } from '../db/schema.ts'
import { desc, eq } from 'drizzle-orm'
import { validateSession } from './auth.ts'
import { ForbiddenError } from './errors.ts'

export const getBoards = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await validateSession()
  
  if (!user) {
    return []
  }
  
  const boards = await db
    .select()
    .from(kanbanBoard)
    .where(eq(kanbanBoard.userId, user.id))
    .orderBy(desc(kanbanBoard.createdAt))
  
  return boards
})

export const createBoard = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [board] = await db
      .insert(kanbanBoard)
      .values({
        userId: user.id,
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
            userId: user.id,
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
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, ctx.data))
    
    if (!board) {
      throw new Error('Board not found')
    }

    if (board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
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
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [existingBoard] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, ctx.data.id))
      .limit(1)
    
    if (!existingBoard) {
      throw new Error('Board not found')
    }
    
    if (existingBoard.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

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
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, ctx.data.boardId))
      .limit(1)
    
    if (!board) {
      throw new Error('Board not found')
    }
    
    if (board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    const [column] = await db
      .insert(kanbanColumn)
      .values({
        userId: user.id,
        kanbanBoardId: ctx.data.boardId,
        name: ctx.data.name,
      })
      .returning()

    return column
  })

export const updateColumn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; name: string }) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [column] = await db
      .select()
      .from(kanbanColumn)
      .where(eq(kanbanColumn.id, ctx.data.id))
      .limit(1)
    
    if (!column) {
      throw new Error('Column not found')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, column.kanbanBoardId))
      .limit(1)
    
    if (!board || board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    const [updatedColumn] = await db
      .update(kanbanColumn)
      .set({
        name: ctx.data.name,
        updatedAt: new Date(),
      })
      .where(eq(kanbanColumn.id, ctx.data.id))
      .returning()

    return updatedColumn
  })

export const deleteColumn = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [column] = await db
      .select()
      .from(kanbanColumn)
      .where(eq(kanbanColumn.id, ctx.data))
      .limit(1)
    
    if (!column) {
      throw new Error('Column not found')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, column.kanbanBoardId))
      .limit(1)
    
    if (!board || board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    await db.delete(kanbanCard).where(eq(kanbanCard.kanbanColumnId, ctx.data))
    await db.delete(kanbanColumn).where(eq(kanbanColumn.id, ctx.data))
    return { success: true }
  })

export const createCard = createServerFn({ method: 'POST' })
  .inputValidator((data: { columnId: number; boardId: number; name: string; description?: string }) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, ctx.data.boardId))
      .limit(1)
    
    if (!board) {
      throw new Error('Board not found')
    }
    
    if (board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    const [card] = await db
      .insert(kanbanCard)
      .values({
        userId: user.id,
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
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [card] = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.id, ctx.data.id))
      .limit(1)
    
    if (!card) {
      throw new Error('Card not found')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, card.kanbanBoardId))
      .limit(1)
    
    if (!board || board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    const [updatedCard] = await db
      .update(kanbanCard)
      .set({
        name: ctx.data.name,
        description: ctx.data.description,
        updatedAt: new Date(),
      })
      .where(eq(kanbanCard.id, ctx.data.id))
      .returning()

    return updatedCard
  })

export const deleteCard = createServerFn({ method: 'POST' })
  .inputValidator((data: number) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [card] = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.id, ctx.data))
      .limit(1)
    
    if (!card) {
      throw new Error('Card not found')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, card.kanbanBoardId))
      .limit(1)
    
    if (!board || board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    await db.delete(kanbanCard).where(eq(kanbanCard.id, ctx.data))
    return { success: true }
  })

export const moveCard = createServerFn({ method: 'POST' })
  .inputValidator((data: { cardId: number; targetColumnId: number }) => data)
  .handler(async (ctx) => {
    const user = await validateSession()
    
    if (!user) {
      throw new ForbiddenError('Authentication required')
    }
    
    const [card] = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.id, ctx.data.cardId))
      .limit(1)
    
    if (!card) {
      throw new Error('Card not found')
    }
    
    const [board] = await db
      .select()
      .from(kanbanBoard)
      .where(eq(kanbanBoard.id, card.kanbanBoardId))
      .limit(1)
    
    if (!board || board.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this board')
    }

    const [updatedCard] = await db
      .update(kanbanCard)
      .set({
        kanbanColumnId: ctx.data.targetColumnId,
        updatedAt: new Date(),
      })
      .where(eq(kanbanCard.id, ctx.data.cardId))
      .returning()

    return updatedCard
  })
