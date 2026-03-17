import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import type { kanbanBoard } from '../db/schema.ts'

interface SidePanelProps {
  boards: typeof kanbanBoard.$inferSelect[]
  isOpen: boolean
  onClose: () => void
  onBoardCreated?: () => void
}

export default function SidePanel({ boards, isOpen, onClose, onBoardCreated }: SidePanelProps) {
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { createBoard } = await import('../lib/kanban.ts')
      const board = await createBoard({ data: newBoardName.trim() })
      setNewBoardName('')
      setShowAddForm(false)
      onBoardCreated?.()
      navigate({ to: '/kanban/$kanbanId', params: { kanbanId: String(board.id) } })
      onClose()
    } catch (error) {
      console.error('Failed to create board:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setNewBoardName('')
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <aside
        className={`fixed top-0 bottom-16 right-0 z-40 w-64 border-l border-[var(--line)] bg-[var(--header-bg)] transition-transform duration-300 ease-in-out sm:bottom-0 sm:left-0 sm:right-auto sm:top-16 sm:border-l-0 sm:border-r ${
          isOpen ? 'translate-x-0 sm:translate-x-0' : 'translate-x-full sm:-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <h2 className="mb-4 text-lg font-semibold text-[var(--sea-ink)]">Kanban Boards</h2>

          {/* Board List */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {boards.length === 0 ? (
              <p className="text-sm text-[var(--sea-ink-soft)]">No boards yet</p>
            ) : (
              boards.map((board) => (
                <Link
                  key={board.id}
                  to="/kanban/$kanbanId"
                  params={{ kanbanId: String(board.id) }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
                  onClick={onClose}
                >
                  {board.name}
                </Link>
              ))
            )}
            <div className="mt-2 border-t border-[var(--line)] pt-2">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="New board name"
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:border-[var(--lagoon)] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newBoardName.trim()}
                    className="flex-1 rounded-lg bg-[var(--lagoon)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--lagoon-deep)] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
