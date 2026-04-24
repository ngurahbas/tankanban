import type { kanbanCard } from '../db/schema'

export type Card = typeof kanbanCard.$inferSelect

export function groupCardsByColumn(cards: Card[]): Map<number, Card[]> {
  const map = new Map<number, Card[]>()
  for (const card of cards) {
    const list = map.get(card.kanbanColumnId)
    if (list) {
      list.push(card)
    } else {
      map.set(card.kanbanColumnId, [card])
    }
  }
  return map
}

export function mapCardsById(cards: Card[]): Map<number, Card> {
  const map = new Map<number, Card>()
  for (const card of cards) {
    map.set(card.id, card)
  }
  return map
}