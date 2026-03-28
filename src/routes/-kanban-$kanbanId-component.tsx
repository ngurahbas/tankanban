import { useState } from 'react'
import { Route } from './kanban.$kanbanId'
import MainPanel from '../components/MainPanel.tsx'
import SidePanel from '../components/SidePanel.tsx'
import { KanbanBoardView } from '../components/KanbanBoardView.tsx'

export function KanbanBoardPage() {
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
