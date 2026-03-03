import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getBoards } from '../lib/kanban.ts'
import MainPanel from '../components/MainPanel.tsx'
import SidePanel from '../components/SidePanel.tsx'

export const Route = createFileRoute('/kanban')({
  component: KanbanPage,
  loader: async () => {
    const boards = await getBoards()
    return { boards }
  },
})

function KanbanPage() {
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
      {/* Main Panel - Fixed position */}
      <MainPanel onMenuToggle={() => setIsSidePanelOpen(!isSidePanelOpen)} />

      {/* Side Panel - Slides in/out */}
      <SidePanel
        boards={boards}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onBoardCreated={refreshBoards}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 pt-4 sm:pb-0 sm:pt-16">
        <div className="flex h-full items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-[var(--sea-ink)]">
              Welcome to Kanban
            </h1>
            <p className="mb-6 max-w-md text-lg text-[var(--sea-ink-soft)]">
              Create a new board to get started with your project management
            </p>
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="rounded-full bg-[var(--lagoon)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--lagoon-deep)]"
            >
              Create New Board
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
