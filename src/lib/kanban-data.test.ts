import { describe, it, expect } from 'vitest'
import { groupCardsByColumn, mapCardsById } from './kanban-data'
import type { kanbanCard } from '../db/schema'

type Card = typeof kanbanCard.$inferSelect

function makeCard(overrides: Partial<Card> & { id: number; kanbanColumnId: number }): Card {
  return {
    userId: 1,
    kanbanBoardId: 1,
    name: `Card ${overrides.id}`,
    description: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }
}

describe('groupCardsByColumn', () => {
  it('returns empty map for empty array', () => {
    const result = groupCardsByColumn([])
    expect(result.size).toBe(0)
  })

  it('groups cards by kanbanColumnId', () => {
    const cards = [
      makeCard({ id: 1, kanbanColumnId: 10 }),
      makeCard({ id: 2, kanbanColumnId: 10 }),
      makeCard({ id: 3, kanbanColumnId: 20 }),
    ]
    const result = groupCardsByColumn(cards)
    expect(result.size).toBe(2)
    expect(result.get(10)!.map(c => c.id)).toEqual([1, 2])
    expect(result.get(20)!.map(c => c.id)).toEqual([3])
  })

  it('returns undefined for column with no cards', () => {
    const result = groupCardsByColumn([makeCard({ id: 1, kanbanColumnId: 10 })])
    expect(result.get(999)).toBeUndefined()
  })

  it('preserves insertion order within each column', () => {
    const cards = [
      makeCard({ id: 1, kanbanColumnId: 10, name: 'Alpha' }),
      makeCard({ id: 2, kanbanColumnId: 10, name: 'Beta' }),
      makeCard({ id: 3, kanbanColumnId: 10, name: 'Gamma' }),
    ]
    const result = groupCardsByColumn(cards)
    const col10 = result.get(10)!
    expect(col10.map(c => c.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })
})

describe('mapCardsById', () => {
  it('returns empty map for empty array', () => {
    const result = mapCardsById([])
    expect(result.size).toBe(0)
  })

  it('maps cards by id for O(1) lookup', () => {
    const cards = [
      makeCard({ id: 1, kanbanColumnId: 10 }),
      makeCard({ id: 2, kanbanColumnId: 20 }),
      makeCard({ id: 3, kanbanColumnId: 10 }),
    ]
    const result = mapCardsById(cards)
    expect(result.size).toBe(3)
    expect(result.get(1)!.kanbanColumnId).toBe(10)
    expect(result.get(2)!.kanbanColumnId).toBe(20)
    expect(result.get(3)!.kanbanColumnId).toBe(10)
  })

  it('returns undefined for missing id', () => {
    const cards = [makeCard({ id: 1, kanbanColumnId: 10 })]
    const result = mapCardsById(cards)
    expect(result.get(999)).toBeUndefined()
  })

  it('last card wins when duplicate ids exist', () => {
    const cards = [
      makeCard({ id: 1, kanbanColumnId: 10, name: 'First' }),
      makeCard({ id: 1, kanbanColumnId: 20, name: 'Second' }),
    ]
    const result = mapCardsById(cards)
    expect(result.get(1)!.name).toBe('Second')
    expect(result.get(1)!.kanbanColumnId).toBe(20)
  })
})