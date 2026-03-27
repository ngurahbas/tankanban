import { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Trash2 } from 'lucide-react'
import type { kanbanColumn, kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'
import { KanbanCard } from './KanbanCard'
import { Button } from './ui/button'
import { updateColumn, deleteColumn, createCard } from '../lib/kanban.ts'

const pulseGlowStyles = `
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); transform: scale(1); }
  50% { box-shadow: 0 0 20px 4px rgba(37, 99, 235, 0.4); transform: scale(1.02); }
}
.animate-pulse-glow {
  animation: pulse-glow 1.5s ease-in-out 2;
}
`

interface KanbanColumnProps {
  column: typeof kanbanColumn.$inferSelect
  cards: typeof kanbanCard.$inferSelect[]
  boardId: number
  columnIndex: number
  totalColumns: number
  onMoveColumnLeft: (columnId: number) => void
  onMoveColumnRight: (columnId: number) => void
  onMoveCardLeft: (cardId: number) => void
  onMoveCardRight: (cardId: number) => void
  onColumnUpdated: () => void
  isNewlyAdded?: boolean
  onDismissHint?: () => void
  isColumnLayoutUnlocked?: boolean
}

export function KanbanColumn({
  column,
  cards,
  boardId,
  columnIndex,
  totalColumns,
  onMoveColumnLeft,
  onMoveColumnRight,
  onMoveCardLeft,
  onMoveCardRight,
  onColumnUpdated,
  isNewlyAdded = false,
  onDismissHint,
  isColumnLayoutUnlocked = false,
}: KanbanColumnProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [hintPhase, setHintPhase] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>(
    isNewlyAdded ? 'entering' : 'hidden'
  )
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

  // Sync hintPhase when isNewlyAdded prop changes
  useEffect(() => {
    if (isNewlyAdded && hintPhase === 'hidden') {
      setHintPhase('entering')
    }
  }, [isNewlyAdded, hintPhase])

  const handleUpdateColumn = async (columnId: number, name: string) => {
    try {
      await updateColumn({ data: { id: columnId, name } })
      onColumnUpdated()
    } catch (error) {
      console.error('Failed to update column:', error)
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    try {
      await deleteColumn({ data: columnId })
      onColumnUpdated()
    } catch (error) {
      console.error('Failed to delete column:', error)
    }
  }

  const handleCreateCard = async (columnId: number, name: string) => {
    try {
      await createCard({ data: { columnId, boardId, name } })
      onColumnUpdated()
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  useEffect(() => {
    if (!isConfirmingDelete) return

    const timeoutId = setTimeout(() => {
      setIsConfirmingDelete(false)
    }, 3000)

    const handleClickOutside = (event: MouseEvent) => {
      if (deleteButtonRef.current && !deleteButtonRef.current.contains(event.target as Node)) {
        setIsConfirmingDelete(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isConfirmingDelete])

  useEffect(() => {
    if (hintPhase === 'hidden') return

    let timeoutId: NodeJS.Timeout

    if (hintPhase === 'entering') {
      timeoutId = setTimeout(() => {
        setHintPhase('visible')
      }, 300)
    } else if (hintPhase === 'visible') {
      timeoutId = setTimeout(() => {
        setHintPhase('exiting')
      }, 4000)
    } else if (hintPhase === 'exiting') {
      timeoutId = setTimeout(() => {
        setHintPhase('hidden')
        onDismissHint?.()
      }, 500)
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [hintPhase, onDismissHint])

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      handleDeleteColumn(column.id)
    } else {
      setIsConfirmingDelete(true)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${column.id}`, disabled: !isColumnLayoutUnlocked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleAddCard = () => {
    if (newCardName.trim()) {
      handleCreateCard(column.id, newCardName.trim())
      setNewCardName('')
      setShowAddCard(false)
    }
  }

  return (
    <>
      <style>{pulseGlowStyles}</style>
      <div
      ref={setNodeRef}
      style={style}
      className={`group flex h-fit w-[85vw] sm:w-72 flex-shrink-0 flex-col rounded-lg border border-[var(--line)] bg-[var(--header-bg)] ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] p-3">
        <div className="flex-1">
          <InlineEdit
            value={column.name}
            onSave={(value) => handleUpdateColumn(column.id, value)}
            className="font-semibold text-[var(--sea-ink)]"
          />
        </div>
        {isColumnLayoutUnlocked && (
          <div className="relative flex items-center gap-1 sm:hidden">
            {hintPhase !== 'hidden' && (
              <div className={`absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg transition-all duration-300 ${hintPhase === 'entering' ? 'opacity-0 translate-y-[-4px] animate-pulse-glow' : hintPhase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-4px]'}`}>
                Use ↑↓ to reorder
              </div>
            )}
            <button
              onClick={() => onMoveColumnLeft(column.id)}
              disabled={columnIndex === 0}
              className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move column left"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => onMoveColumnRight(column.id)}
              disabled={columnIndex === totalColumns - 1}
              className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Move column right"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={handleDeleteClick}
                className={`rounded p-1 ${
                  isConfirmingDelete
                    ? 'bg-red-100 text-red-600'
                    : 'text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600'
                }`}
                aria-label="Delete column"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {isConfirmingDelete && (
                <div className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs text-white shadow-lg">
                  Click again to delete
                </div>
              )}
            </div>
          </div>
        )}
        {isColumnLayoutUnlocked && (
          <div className="relative hidden gap-1 sm:flex">
            {hintPhase !== 'hidden' && (
              <div className={`absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-blue-600 px-2 py-1 text-xs text-white shadow-lg transition-all duration-300 ${hintPhase === 'entering' ? 'opacity-0 translate-y-[-4px] animate-pulse-glow' : hintPhase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-4px]'}`}>
                Drag handle to move
              </div>
            )}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] active:cursor-grabbing"
              aria-label="Drag handle"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </button>
            <div className="relative">
              <button
                ref={deleteButtonRef}
                onClick={handleDeleteClick}
                className={`rounded p-1 ${
                  isConfirmingDelete
                    ? 'bg-red-100 text-red-600'
                    : 'text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600'
                }`}
                aria-label="Delete column"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {isConfirmingDelete && (
                <div className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs text-white shadow-lg">
                  Click again to delete
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <SortableContext items={cards.map(c => `card-${c.id}`)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnIndex={columnIndex}
              totalColumns={totalColumns}
              onMoveLeft={onMoveCardLeft}
              onMoveRight={onMoveCardRight}
              onCardUpdated={onColumnUpdated}
            />
          ))}
        </SortableContext>
      </div>

      <div className="border-t border-[var(--line)] p-3">
        {!showAddCard ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddCard(true)}
            className="w-full justify-start text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCard()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  setShowAddCard(false)
                  setNewCardName('')
                }
              }}
              placeholder="Card name"
              className="w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--lagoon)] focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddCard} disabled={!newCardName.trim()}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAddCard(false)
                  setNewCardName('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
