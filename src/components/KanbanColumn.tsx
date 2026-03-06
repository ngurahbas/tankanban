import { useState } from 'react'
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
}

export function KanbanColumn({
  column,
  cards,
  onUpdateColumn,
  onDeleteColumn,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
}: KanbanColumnProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardName, setNewCardName] = useState('')

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
      className={`group flex h-fit w-[85vw] sm:w-72 snap-center flex-shrink-0 flex-col rounded-lg border border-[var(--line)] bg-[var(--header-bg)] ${
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
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:sm:opacity-100">
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
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600"
            aria-label="Delete column"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
