import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KanbanCard } from './KanbanCard'
import * as kanbanLib from '../lib/kanban'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}))

vi.mock('../lib/kanban', () => ({
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
}))

describe('KanbanCard', () => {
  const mockCard = {
    id: 1,
    userId: 1,
    kanbanBoardId: 1,
    kanbanColumnId: 1,
    name: 'Test Card',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const defaultProps = {
    card: mockCard,
    columnIndex: 1,
    totalColumns: 3,
    onMoveLeft: vi.fn(),
    onMoveRight: vi.fn(),
    onCardUpdated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays card name', () => {
    render(<KanbanCard {...defaultProps} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('shows delete buttons (desktop and mobile)', () => {
    render(<KanbanCard {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText('Delete card')
    expect(deleteButtons).toHaveLength(2)
  })

  it('shows confirmation on first delete click', () => {
    render(<KanbanCard {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText('Delete card')
    fireEvent.click(deleteButtons[0])
    const confirmations = screen.getAllByText('Click again to delete')
    expect(confirmations).toHaveLength(2)
  })

  it('calls deleteCard on second click', async () => {
    render(<KanbanCard {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText('Delete card')
    
    fireEvent.click(deleteButtons[0])
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(kanbanLib.deleteCard).toHaveBeenCalledWith({ data: 1 })
      expect(defaultProps.onCardUpdated).toHaveBeenCalled()
    })
  })

  it('shows confirmation tooltip styling when confirming', () => {
    render(<KanbanCard {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText('Delete card')
    
    fireEvent.click(deleteButtons[0])
    
    expect(deleteButtons[0]).toHaveClass('bg-red-100')
  })

  it('disables move left button at first column', () => {
    render(<KanbanCard {...defaultProps} columnIndex={0} totalColumns={3} />)
    const moveButtons = screen.getAllByRole('button')
    const moveLeftBtn = moveButtons.find(btn => btn.getAttribute('aria-label') === 'Move card to previous column')
    expect(moveLeftBtn).toBeDisabled()
  })

  it('disables move right button at last column', () => {
    render(<KanbanCard {...defaultProps} columnIndex={2} totalColumns={3} />)
    const moveButtons = screen.getAllByRole('button')
    const moveRightBtn = moveButtons.find(btn => btn.getAttribute('aria-label') === 'Move card to next column')
    expect(moveRightBtn).toBeDisabled()
  })

  it('calls onMoveLeft when move left button clicked', () => {
    render(<KanbanCard {...defaultProps} columnIndex={1} totalColumns={3} />)
    const moveButtons = screen.getAllByRole('button')
    const moveLeftBtn = moveButtons.find(btn => btn.getAttribute('aria-label') === 'Move card to previous column')
    fireEvent.click(moveLeftBtn!)
    expect(defaultProps.onMoveLeft).toHaveBeenCalledWith(1)
  })

  it('calls onMoveRight when move right button clicked', () => {
    render(<KanbanCard {...defaultProps} columnIndex={1} totalColumns={3} />)
    const moveButtons = screen.getAllByRole('button')
    const moveRightBtn = moveButtons.find(btn => btn.getAttribute('aria-label') === 'Move card to next column')
    fireEvent.click(moveRightBtn!)
    expect(defaultProps.onMoveRight).toHaveBeenCalledWith(1)
  })
})