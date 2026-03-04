import { useState, useCallback } from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { getBoards } from '../lib/kanban.ts'
import MainPanel from '../components/MainPanel.tsx'
import SidePanel from '../components/SidePanel.tsx'

export const Route = createFileRoute('/kanban')({
  component: KanbanLayout,
  loader: async () => {
    const boards = await getBoards()
    return { boards }
  },
})

function KanbanLayout() {
  const loaderData = Route.useLoaderData()
  const initialBoards = loaderData?.boards ?? []
  const [boards, setBoards] = useState(initialBoards)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  const refreshBoards = useCallback(async () => {
    const newBoards = await getBoards()
    setBoards(newBoards)
  }, [])

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      <MainPanel onMenuToggle={() => setIsSidePanelOpen(!isSidePanelOpen)} />

      <SidePanel
        boards={boards}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onBoardCreated={refreshBoards}
      />

      <main className="flex-1 pb-16 pt-4 sm:pb-0 sm:pt-16">
        <Outlet />
      </main>
    </div>
  )
}
