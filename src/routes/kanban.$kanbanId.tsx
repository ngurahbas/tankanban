import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { getBoards, getBoard } from '../lib/kanban.ts'
import { getCurrentUser } from '../lib/auth.ts'
import MainPanel from '../components/MainPanel.tsx'
import SidePanel from '../components/SidePanel.tsx'
import { KanbanBoardView } from '../components/KanbanBoardView.tsx'

export const Route = createFileRoute('/kanban/$kanbanId')({
  component: KanbanBoardPage,
  loader: async ({ params }) => {
    const [boards, board] = await Promise.all([
      getBoards(),
      getBoard({ data: Number(params.kanbanId) }),
    ])
    return { boards, board }
  },
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
})

function KanbanBoardPage() {
  const { boards, board } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      <MainPanel onMenuToggle={() => setIsSidePanelOpen(!isSidePanelOpen)} user={user} />

      <SidePanel
        boards={boards}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
      />

      <main className="flex-1 pb-16 sm:pb-0 sm:pt-16">
        <KanbanBoardView initialBoard={board} />
      </main>
    </div>
  )
}
