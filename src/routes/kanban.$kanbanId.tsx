import { createFileRoute, redirect } from '@tanstack/react-router'
import { getBoards, getBoard } from '../lib/kanban.ts'
import { getCurrentUser } from '../lib/auth.ts'
import { KanbanBoardPage } from './-kanban-$kanbanId-component'

export const Route = createFileRoute('/kanban/$kanbanId')({
  component: KanbanBoardPage,
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  loader: async ({ params }) => {
    const [boards, board] = await Promise.all([
      getBoards(),
      getBoard({ data: Number(params.kanbanId) }),
    ])
    return { boards, board }
  },
})
