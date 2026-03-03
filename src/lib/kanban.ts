import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index.ts'
import { kanbanBoard } from '../db/schema.ts'
import { desc } from 'drizzle-orm'

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

    return board
  })
