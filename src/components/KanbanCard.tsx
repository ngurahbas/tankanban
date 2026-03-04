import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import type { kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'

interface KanbanCardProps {
  card: typeof kanbanCard.$inferSelect
  onUpdate: (cardId: number, data: { name?: string; description?: string }) => void
  onDelete: (cardId: number) => void
}

export function KanbanCard({ card, onUpdate, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-[var(--line)] bg-[var(--card)] p-3 shadow-sm transition hover:shadow-md ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <InlineEdit
            value={card.name}
            onSave={(value) => onUpdate(card.id, { name: value })}
            className="font-medium text-[var(--sea-ink)]"
          />
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
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
            onClick={() => onDelete(card.id)}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600"
            aria-label="Delete card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <InlineEdit
        value={card.description ?? ''}
        onSave={(value) => onUpdate(card.id, { description: value })}
        multiline
        className="text-sm text-[var(--sea-ink-soft)]"
        placeholder="Add description..."
      />
    </div>
  )
}
