import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kanban/')({
  component: KanbanIndexPage,
})

function KanbanIndexPage() {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-[var(--sea-ink)]">
          Welcome to Kanban
        </h1>
        <p className="mb-6 max-w-md text-lg text-[var(--sea-ink-soft)]">
          Create a new board to get started with your project management
        </p>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Click the menu button (☰) to open the side panel and create a new board
        </p>
      </div>
    </div>
  )
}
