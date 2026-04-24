import { useState, useCallback, useEffect, useMemo, memo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Plus, Lock, Unlock } from 'lucide-react'
import type { kanbanBoard, kanbanColumn, kanbanCard } from '../db/schema'
import { InlineEdit } from './ui/inline-edit'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { Button } from './ui/button'
import { getBoard, updateBoard, createColumn, moveCard } from '../lib/kanban.ts'
import { groupCardsByColumn, mapCardsById } from '../lib/kanban-data'

const FIRST_CARD_HINT_KEY = 'kanban-first-card-hint-shown'

const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } }
const TOUCH_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } }

interface KanbanBoardViewProps {
  initialBoard: typeof kanbanBoard.$inferSelect & {
    columns: typeof kanbanColumn.$inferSelect[]
    cards: typeof kanbanCard.$inferSelect[]
  }
}

function KanbanBoardViewInner({
  initialBoard,
}: KanbanBoardViewProps) {
  const navigate = useNavigate()
  const params = useParams({ from: '/kanban/$kanbanId' })
  const [board, setBoard] = useState(initialBoard)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [columns, setColumns] = useState(board.columns)
  const [activeCard, setActiveCard] = useState<typeof kanbanCard.$inferSelect | null>(null)
  const [newlyAddedColumnIds, setNewlyAddedColumnIds] = useState<Set<number>>(new Set())
  const [pendingColumnName, setPendingColumnName] = useState<string | null>(null)
  const [isColumnLayoutUnlocked, setIsColumnLayoutUnlocked] = useState(false)
  const [firstCardId, setFirstCardId] = useState<number | null>(null)
  const [hasSeenFirstCardHint, setHasSeenFirstCardHint] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FIRST_CARD_HINT_KEY) === 'true'
    }
    return false
  })

  const cardsByColumn = useMemo(() => groupCardsByColumn(board.cards), [board.cards])

  const cardsById = useMemo(() => mapCardsById(board.cards), [board.cards])

  const refreshBoard = useCallback(async () => {
    try {
      const newBoard = await getBoard({ data: Number(params.kanbanId) })
      setBoard(newBoard)
      setColumns(newBoard.columns)
    } catch (error) {
      console.error('Failed to refresh board:', error)
      navigate({ to: '/kanban' })
    }
  }, [params.kanbanId, navigate])

  useEffect(() => {
    setBoard(initialBoard)
    setColumns(initialBoard.columns)
  }, [initialBoard])

  // Track when the first card is added to show the hint
  useEffect(() => {
    if (hasSeenFirstCardHint || firstCardId !== null) return
    
    if (board.cards.length === 1) {
      setFirstCardId(board.cards[0].id)
    }
  }, [board.cards, hasSeenFirstCardHint, firstCardId])

  const dismissFirstCardHint = useCallback(() => {
    setFirstCardId(null)
    setHasSeenFirstCardHint(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(FIRST_CARD_HINT_KEY, 'true')
    }
  }, [])

  const handleUpdateBoard = useCallback(async (boardId: number, name: string) => {
    try {
      await updateBoard({ data: { id: boardId, name } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to update board:', error)
    }
  }, [refreshBoard])

  const handleCreateColumn = useCallback(async (boardId: number, name: string) => {
    try {
      await createColumn({ data: { boardId, name } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to create column:', error)
    }
  }, [refreshBoard])

  const handleMoveCard = useCallback(async (cardId: number, targetColumnId: number) => {
    try {
      await moveCard({ data: { cardId, targetColumnId } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to move card:', error)
    }
  }, [refreshBoard])

  const handleReorderColumns = useCallback(async (boardId: number, columnIds: number[]) => {
    try {
      const columnsOrder = columnIds.join(',')
      await updateBoard({ data: { id: boardId, name: board.name, columnsOrder } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to reorder columns:', error)
    }
  }, [board.name, refreshBoard])

  useEffect(() => {
    setColumns(board.columns)
  }, [board.columns])

  useEffect(() => {
    if (pendingColumnName) {
      const newColumn = board.columns.find(col => col.name === pendingColumnName)
      if (newColumn) {
        setNewlyAddedColumnIds(prev => new Set(prev).add(newColumn.id))
        setPendingColumnName(null)
      }
    }
  }, [board.columns, pendingColumnName])

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const activeIdStr = String(active.id)
    if (activeIdStr.startsWith('card-')) {
      const cardId = Number(activeIdStr.replace('card-', ''))
      const card = cardsById.get(cardId)
      if (card) {
        setActiveCard(card)
      }
    }
  }, [cardsById])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    if (activeIdStr === overIdStr) return

    const isActiveACard = activeIdStr.startsWith('card-')
    const isOverACard = overIdStr.startsWith('card-')
    const isOverAColumn = overIdStr.startsWith('column-')

    if (isActiveACard && (isOverACard || isOverAColumn)) {
      const cardId = Number(activeIdStr.replace('card-', ''))
      const activeCard = cardsById.get(cardId)!

      let overColumnId: number
      if (isOverAColumn) {
        overColumnId = Number(overIdStr.replace('column-', ''))
      } else {
        const overCardId = Number(overIdStr.replace('card-', ''))
        const overCard = cardsById.get(overCardId)
        if (!overCard) return
        overColumnId = overCard.kanbanColumnId
      }

      if (activeCard.kanbanColumnId !== overColumnId) {
        handleMoveCard(cardId, overColumnId)
      }
    } else if (isColumnLayoutUnlocked && activeIdStr.startsWith('column-') && overIdStr.startsWith('column-')) {
      const activeColumnId = Number(activeIdStr.replace('column-', ''))
      const overColumnId = Number(overIdStr.replace('column-', ''))

      const oldIndex = columns.findIndex(c => c.id === activeColumnId)
      const newIndex = columns.findIndex(c => c.id === overColumnId)

      if (oldIndex !== newIndex) {
        const newColumns = arrayMove(columns, oldIndex, newIndex)
        setColumns(newColumns)
        handleReorderColumns(board.id, newColumns.map(c => c.id))
      }
    }
  }, [cardsById, columns, handleMoveCard, handleReorderColumns, isColumnLayoutUnlocked, board.id])

  const handleAddColumn = useCallback(() => {
    if (newColumnName.trim()) {
      const name = newColumnName.trim()
      setPendingColumnName(name)
      handleCreateColumn(board.id, name)
      setNewColumnName('')
      setShowAddColumn(false)
    }
  }, [newColumnName, handleCreateColumn, board.id])

  const handleHintDismiss = useCallback((columnId: number) => {
    setNewlyAddedColumnIds(prev => {
      const next = new Set(prev)
      next.delete(columnId)
      return next
    })
  }, [])

  const handleMoveCardLeft = useCallback((cardId: number) => {
    const card = cardsById.get(cardId)
    if (!card) return

    const currentColumnIndex = columns.findIndex(c => c.id === card.kanbanColumnId)
    if (currentColumnIndex <= 0) return

    const targetColumnId = columns[currentColumnIndex - 1].id
    handleMoveCard(cardId, targetColumnId)
  }, [cardsById, columns, handleMoveCard])

  const handleMoveCardRight = useCallback((cardId: number) => {
    const card = cardsById.get(cardId)
    if (!card) return

    const currentColumnIndex = columns.findIndex(c => c.id === card.kanbanColumnId)
    if (currentColumnIndex >= columns.length - 1) return

    const targetColumnId = columns[currentColumnIndex + 1].id
    handleMoveCard(cardId, targetColumnId)
  }, [cardsById, columns, handleMoveCard])

  const handleMoveColumnLeft = useCallback((columnId: number) => {
    const currentIndex = columns.findIndex(c => c.id === columnId)
    if (currentIndex <= 0) return

    const newColumns = arrayMove(columns, currentIndex, currentIndex - 1)
    setColumns(newColumns)
    handleReorderColumns(board.id, newColumns.map(c => c.id))
  }, [columns, handleReorderColumns, board.id])

  const handleMoveColumnRight = useCallback((columnId: number) => {
    const currentIndex = columns.findIndex(c => c.id === columnId)
    if (currentIndex >= columns.length - 1) return

    const newColumns = arrayMove(columns, currentIndex, currentIndex + 1)
    setColumns(newColumns)
    handleReorderColumns(board.id, newColumns.map(c => c.id))
  }, [columns, handleReorderColumns, board.id])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--line)] bg-[var(--header-bg)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <InlineEdit
            value={board.name}
            onSave={(value) => handleUpdateBoard(board.id, value)}
            className="text-2xl font-bold text-[var(--sea-ink)]"
          />
          <button
            onClick={() => setIsColumnLayoutUnlocked(!isColumnLayoutUnlocked)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isColumnLayoutUnlocked
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-[var(--link-bg)] text-[var(--lagoon)] hover:bg-[var(--link-bg-hover)]'
            }`}
            title={isColumnLayoutUnlocked ? 'Lock column layout' : 'Unlock to add, delete, or reorder columns'}
          >
            {isColumnLayoutUnlocked ? (
              <>
                <Unlock className="h-4 w-4" />
                <span className="hidden sm:inline">Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Locked</span>
              </>
            )}
          </button>
        </div>
      </div>

      <DndContext
        id={`dnd-context-${board.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-gradient flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <SortableContext items={columns.map(c => `column-${c.id}`)} strategy={horizontalListSortingStrategy}>
              {columns.map((column, index) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  cards={cardsByColumn.get(column.id) ?? []}
                  boardId={board.id}
                  columnIndex={index}
                  totalColumns={columns.length}
                  onMoveColumnLeft={handleMoveColumnLeft}
                  onMoveColumnRight={handleMoveColumnRight}
                  onMoveCardLeft={handleMoveCardLeft}
                  onMoveCardRight={handleMoveCardRight}
                  onColumnUpdated={refreshBoard}
                  isNewlyAdded={newlyAddedColumnIds.has(column.id)}
                  onDismissHint={() => handleHintDismiss(column.id)}
                  isColumnLayoutUnlocked={isColumnLayoutUnlocked}
                  firstCardId={firstCardId}
                  onDismissCardHint={dismissFirstCardHint}
                />
              ))}
            </SortableContext>

            {isColumnLayoutUnlocked && (
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
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard
              card={activeCard}
              columnIndex={0}
              totalColumns={1}
              onMoveLeft={() => {}}
              onMoveRight={() => {}}
              onCardUpdated={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export const KanbanBoardView = memo(KanbanBoardViewInner)
