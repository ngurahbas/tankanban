import { createFileRoute, redirect } from '@tanstack/react-router'
import { getBoards } from '../lib/kanban.ts'
import { getCurrentUser } from '../lib/auth.ts'
import { KanbanLayout } from './-kanban-component'

export const Route = createFileRoute('/kanban')({
  component: KanbanLayout,
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  loader: async () => {
    const boards = await getBoards()
    return { boards }
  },
})
