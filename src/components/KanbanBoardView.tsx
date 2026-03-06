import { useState, useCallback, useEffect } from 'react'
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { kanbanBoard, kanbanColumn, kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Button } from './ui/button'

interface KanbanBoardViewProps {
  board: typeof kanbanBoard.$inferSelect & {
    columns: typeof kanbanColumn.$inferSelect[]
    cards: typeof kanbanCard.$inferSelect[]
  }
  onUpdateBoard: (boardId: number, name: string) => void
  onCreateColumn: (boardId: number, name: string) => void
  onUpdateColumn: (columnId: number, name: string) => void
  onDeleteColumn: (columnId: number) => void
  onCreateCard: (columnId: number, boardId: number, name: string) => void
  onUpdateCard: (cardId: number, data: { name?: string; description?: string }) => void
  onDeleteCard: (cardId: number) => void
  onMoveCard: (cardId: number, targetColumnId: number) => void
  onReorderColumns: (boardId: number, columnIds: number[]) => void
}

export function KanbanBoardView({
  board,
  onUpdateBoard,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
  onReorderColumns,
}: KanbanBoardViewProps) {
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [columns, setColumns] = useState(board.columns)
  const [activeCard, setActiveCard] = useState<typeof kanbanCard.$inferSelect | null>(null)

  useEffect(() => {
    setColumns(board.columns)
  }, [board.columns])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = board.cards.find(c => c.id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveACard = board.cards.some(c => c.id === activeId)
    const isOverACard = board.cards.some(c => c.id === overId)
    const isOverAColumn = board.columns.some(c => c.id === overId)

    if (isActiveACard && (isOverACard || isOverAColumn)) {
      const activeCard = board.cards.find(c => c.id === activeId)!
      const overColumn = isOverAColumn
        ? board.columns.find(c => c.id === overId)!
        : board.columns.find(c => c.id === board.cards.find(c => c.id === overId)?.kanbanColumnId)

      if (overColumn && activeCard.kanbanColumnId !== overColumn.id) {
        onMoveCard(activeId as number, overColumn.id)
      }
    } else {
      const isActiveAColumn = board.columns.some(c => c.id === activeId)
      const isOverAColumn = board.columns.some(c => c.id === overId)

      if (isActiveAColumn && isOverAColumn) {
        const oldIndex = columns.findIndex(c => c.id === activeId)
        const newIndex = columns.findIndex(c => c.id === overId)

        if (oldIndex !== newIndex) {
          const newColumns = arrayMove(columns, oldIndex, newIndex)
          setColumns(newColumns)
          onReorderColumns(board.id, newColumns.map(c => c.id))
        }
      }
    }
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onCreateColumn(board.id, newColumnName.trim())
      setNewColumnName('')
      setShowAddColumn(false)
    }
  }

  const handleMoveCardLeft = (cardId: number) => {
    const card = board.cards.find(c => c.id === cardId)
    if (!card) return

    const currentColumnIndex = columns.findIndex(c => c.id === card.kanbanColumnId)
    if (currentColumnIndex <= 0) return

    const targetColumnId = columns[currentColumnIndex - 1].id
    onMoveCard(cardId, targetColumnId)
  }

  const handleMoveCardRight = (cardId: number) => {
    const card = board.cards.find(c => c.id === cardId)
    if (!card) return

    const currentColumnIndex = columns.findIndex(c => c.id === card.kanbanColumnId)
    if (currentColumnIndex >= columns.length - 1) return

    const targetColumnId = columns[currentColumnIndex + 1].id
    onMoveCard(cardId, targetColumnId)
  }

  const handleMoveColumnLeft = (columnId: number) => {
    const currentIndex = columns.findIndex(c => c.id === columnId)
    if (currentIndex <= 0) return

    const newColumns = arrayMove(columns, currentIndex, currentIndex - 1)
    setColumns(newColumns)
    onReorderColumns(board.id, newColumns.map(c => c.id))
  }

  const handleMoveColumnRight = (columnId: number) => {
    const currentIndex = columns.findIndex(c => c.id === columnId)
    if (currentIndex >= columns.length - 1) return

    const newColumns = arrayMove(columns, currentIndex, currentIndex + 1)
    setColumns(newColumns)
    onReorderColumns(board.id, newColumns.map(c => c.id))
  }

  const getColumnCards = useCallback(
    (columnId: number) => {
      return board.cards.filter((card) => card.kanbanColumnId === columnId)
    },
    [board.cards]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)] px-6 py-4">
        <InlineEdit
          value={board.name}
          onSave={(value) => onUpdateBoard(board.id, value)}
          className="text-2xl font-bold text-[var(--sea-ink)]"
        />
      </div>

      <DndContext
        id={`dnd-context-${board.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4 h-full">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column, index) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={getColumnCards(column.id)}
                  onUpdateColumn={onUpdateColumn}
                  onDeleteColumn={onDeleteColumn}
                  onCreateCard={(columnId, name) => onCreateCard(columnId, board.id, name)}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                  columnIndex={index}
                  totalColumns={columns.length}
                  onMoveColumnLeft={handleMoveColumnLeft}
                  onMoveColumnRight={handleMoveColumnRight}
                  onMoveCardLeft={handleMoveCardLeft}
                  onMoveCardRight={handleMoveCardRight}
                />
              ))}
            </SortableContext>

            <div className="flex-shrink-0">
              {!showAddColumn ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddColumn(true)}
                  className="h-fit w-[85vw] sm:w-72 justify-start border-dashed border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] hover:border-[var(--lagoon)] hover:bg-[var(--link-bg-hover)]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column
                </Button>
              ) : (
                <div className="w-[85vw] sm:w-72 rounded-lg border border-[var(--line)] bg-[var(--header-bg)] p-3">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddColumn()
                      } else if (e.key === 'Escape') {
                        e.preventDefault()
                        setShowAddColumn(false)
                        setNewColumnName('')
                      }
                    }}
                    placeholder="Column name"
                    className="mb-2 w-full rounded-md border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--lagoon)] focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAddColumn(false)
                        setNewColumnName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard
              card={activeCard}
              onUpdate={() => {}}
              onDelete={() => {}}
              columnIndex={0}
              totalColumns={1}
              onMoveLeft={() => {}}
              onMoveRight={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
