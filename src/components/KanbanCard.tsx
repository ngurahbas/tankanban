import { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import type { kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'

interface KanbanCardProps {
  card: typeof kanbanCard.$inferSelect
  onUpdate: (cardId: number, data: { name?: string; description?: string }) => void
  onDelete: (cardId: number) => void
  columnIndex: number
  totalColumns: number
  onMoveLeft: (cardId: number) => void
  onMoveRight: (cardId: number) => void
}

export function KanbanCard({ card, onUpdate, onDelete, columnIndex, totalColumns, onMoveLeft, onMoveRight }: KanbanCardProps) {
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
      onDelete(card.id)
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
              aria-label="Delete card"
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
      <InlineEdit
        value={card.description ?? ''}
        onSave={(value) => onUpdate(card.id, { description: value })}
        multiline
        className="text-sm text-[var(--sea-ink-soft)]"
        placeholder="Add description..."
      />
      <div className="mt-3 flex items-center justify-between sm:hidden">
        <div className="flex gap-1">
          <button
            onClick={() => onMoveLeft(card.id)}
            disabled={columnIndex === 0}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move card to previous column"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMoveRight(card.id)}
            disabled={columnIndex === totalColumns - 1}
            className="rounded p-1 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move card to next column"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <button
            onClick={handleDeleteClick}
            className={`rounded p-1 ${
              isConfirmingDelete
                ? 'bg-red-100 text-red-600'
                : 'text-[var(--sea-ink-soft)] hover:bg-red-50 hover:text-red-600'
            }`}
            aria-label="Delete card"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          {isConfirmingDelete && (
            <div className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-red-600 px-2 py-1 text-xs text-white shadow-lg">
              Click again to delete
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
