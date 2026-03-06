import { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Trash2 } from 'lucide-react'
import type { kanbanColumn, kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'
import { KanbanCard } from './KanbanCard'
import { Button } from './ui/button'

interface KanbanColumnProps {
  column: typeof kanbanColumn.$inferSelect
  cards: typeof kanbanCard.$inferSelect[]
  onUpdateColumn: (columnId: number, name: string) => void
  onDeleteColumn: (columnId: number) => void
  onCreateCard: (columnId: number, name: string) => void
  onUpdateCard: (cardId: number, data: { name?: string; description?: string }) => void
  onDeleteCard: (cardId: number) => void
  columnIndex: number
  totalColumns: number
  onMoveColumnLeft: (columnId: number) => void
  onMoveColumnRight: (columnId: number) => void
  onMoveCardLeft: (cardId: number) => void
  onMoveCardRight: (cardId: number) => void
}

export function KanbanColumn({
  column,
  cards,
  onUpdateColumn,
  onDeleteColumn,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  columnIndex,
  totalColumns,
  onMoveColumnLeft,
  onMoveColumnRight,
  onMoveCardLeft,
  onMoveCardRight,
}: KanbanColumnProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)

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

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      onDeleteColumn(column.id)
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
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleAddCard = () => {
    if (newCardName.trim()) {
      onCreateCard(column.id, newCardName.trim())
      setNewCardName('')
      setShowAddCard(false)
    }
  }

  return (
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
            onSave={(value) => onUpdateColumn(column.id, value)}
            className="font-semibold text-[var(--sea-ink)]"
          />
        </div>
        <div className="flex items-center gap-1 sm:hidden">
          <button
            onClick={() => onMoveColumnLeft(column.id)}
            disabled={columnIndex === 0}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move column left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7M3 12h18" />
            </svg>
          </button>
          <button
            onClick={() => onMoveColumnRight(column.id)}
            disabled={columnIndex === totalColumns - 1}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move column right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M3 12h18" />
            </svg>
          </button>
        </div>
        <div className="hidden gap-1 sm:flex">
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
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              columnIndex={columnIndex}
              totalColumns={totalColumns}
              onMoveLeft={onMoveCardLeft}
              onMoveRight={onMoveCardRight}
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
  )
}
