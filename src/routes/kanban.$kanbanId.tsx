import { useState, useCallback, useEffect } from 'react'
import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { getBoards, getBoard, updateBoard, createColumn, updateColumn, deleteColumn, createCard, updateCard, deleteCard, moveCard } from '../lib/kanban.ts'
import { getCurrentUser } from '../lib/auth.ts'
import MainPanel from '../components/MainPanel.tsx'
import SidePanel from '../components/SidePanel.tsx'
import { KanbanBoardView } from '../components/KanbanBoardView.tsx'

export const Route = createFileRoute('/kanban/$kanbanId')({
  component: KanbanBoardPage,
  loader: async ({ params }) => {
    const [boards, board] = await Promise.all([
      getBoards(),
      getBoard({ data: Number(params.kanbanId) }),
    ])
    return { boards, board }
  },
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
})

function KanbanBoardPage() {
  const { boards: initialBoards, board: initialBoard } = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const params = Route.useParams()
  const navigate = useNavigate()
  const [boards, setBoards] = useState(initialBoards)
  const [board, setBoard] = useState(initialBoard)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)

  useEffect(() => {
    setBoard(initialBoard)
  }, [initialBoard])

  const refreshBoards = useCallback(async () => {
    const newBoards = await getBoards()
    setBoards(newBoards)
  }, [])

  const refreshBoard = useCallback(async () => {
    try {
      const newBoard = await getBoard({ data: Number(params.kanbanId) })
      setBoard(newBoard)
    } catch (error) {
      console.error('Failed to refresh board:', error)
      navigate({ to: '/kanban' })
    }
  }, [params.kanbanId, navigate])

  const handleUpdateBoard = async (boardId: number, name: string) => {
    try {
      await updateBoard({ data: { id: boardId, name } })
      await refreshBoard()
      await refreshBoards()
    } catch (error) {
      console.error('Failed to update board:', error)
    }
  }

  const handleCreateColumn = async (boardId: number, name: string) => {
    try {
      await createColumn({ data: { boardId, name } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to create column:', error)
    }
  }

  const handleUpdateColumn = async (columnId: number, name: string) => {
    try {
      await updateColumn({ data: { id: columnId, name } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to update column:', error)
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    try {
      await deleteColumn({ data: columnId })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to delete column:', error)
    }
  }

  const handleCreateCard = async (columnId: number, boardId: number, name: string) => {
    try {
      await createCard({ data: { columnId, boardId, name } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  const handleUpdateCard = async (cardId: number, data: { name?: string; description?: string }) => {
    try {
      await updateCard({ data: { id: cardId, ...data } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to update card:', error)
    }
  }

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCard({ data: cardId })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  const handleMoveCard = async (cardId: number, targetColumnId: number) => {
    try {
      await moveCard({ data: { cardId, targetColumnId } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to move card:', error)
    }
  }

  const handleReorderColumns = async (boardId: number, columnIds: number[]) => {
    try {
      const columnsOrder = columnIds.join(',')
      await updateBoard({ data: { id: boardId, name: board.name, columnsOrder } })
      await refreshBoard()
    } catch (error) {
      console.error('Failed to reorder columns:', error)
    }
  }

  return (
    <div className="flex h-screen flex-col sm:flex-row">
      <MainPanel onMenuToggle={() => setIsSidePanelOpen(!isSidePanelOpen)} user={user} />

      <SidePanel
        boards={boards}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onBoardCreated={refreshBoards}
      />

      <main className="flex-1 pb-16 sm:pb-0 sm:pt-16">
        <KanbanBoardView
          board={board}
          onUpdateBoard={handleUpdateBoard}
          onCreateColumn={handleCreateColumn}
          onUpdateColumn={handleUpdateColumn}
          onDeleteColumn={handleDeleteColumn}
          onCreateCard={handleCreateCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onMoveCard={handleMoveCard}
          onReorderColumns={handleReorderColumns}
        />
      </main>
    </div>
  )
}
