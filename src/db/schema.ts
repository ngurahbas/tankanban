import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const todos = sqliteTable('todos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const kanbanBoard = sqliteTable('kanban_board', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  name: text().notNull(),
  columnsOrder: text('columns_order'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const kanbanColumn = sqliteTable('kanban_column', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  kanbanBoardId: integer('kanban_board_id').notNull().references(() => kanbanBoard.id),
  name: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const kanbanCard = sqliteTable('kanban_card', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  kanbanBoardId: integer('kanban_board_id').notNull().references(() => kanbanBoard.id),
  kanbanColumnId: integer('kanban_column_id').notNull().references(() => kanbanColumn.id),
  name: text().notNull(),
  description: text(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})
