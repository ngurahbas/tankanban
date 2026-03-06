import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// Enums as const arrays
export const authTypes = ['OAUTH2', 'MAGIC_LINK', 'OTP'] as const
export const authProviders = ['GOOGLE', 'GITHUB', 'APPLE'] as const

export type AuthType = typeof authTypes[number]
export type AuthProvider = typeof authProviders[number]

export const todos = sqliteTable('todos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const userAuth = sqliteTable('user_auth', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  authType: text('auth_type', { enum: authTypes }).notNull(),
  authProvider: text('auth_provider', { enum: authProviders }).notNull(),
  authValue: text('auth_value').notNull(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
}, (table) => ({
  uniqueAuth: uniqueIndex('unique_auth_idx').on(table.authType, table.authProvider, table.authValue),
}))

export const session = sqliteTable('session', {
  id: text().primaryKey(),
  userId: integer('user_id').notNull().references(() => userAuth.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const kanbanBoard = sqliteTable('kanban_board', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  userId: integer('user_id').references(() => userAuth.id),
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
  userId: integer('user_id').references(() => userAuth.id),
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
  userId: integer('user_id').references(() => userAuth.id),
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
