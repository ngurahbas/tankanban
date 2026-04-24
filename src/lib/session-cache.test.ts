import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionCache } from './session-cache'

describe('SessionCache', () => {
  let cache: SessionCache<{ id: number; name: string }>

  beforeEach(() => {
    cache = new SessionCache()
  })

  it('returns null for missing key', () => {
    expect(cache.get('nonexistent')).toBeNull()
  })

  it('stores and retrieves values', () => {
    const user = { id: 1, name: 'test' }
    cache.set('session-1', user, 60_000)
    expect(cache.get('session-1')).toEqual(user)
  })

  it('overwrites existing values', () => {
    cache.set('session-1', { id: 1, name: 'first' }, 60_000)
    cache.set('session-1', { id: 2, name: 'second' }, 60_000)
    expect(cache.get('session-1')).toEqual({ id: 2, name: 'second' })
  })

  it('evicts expired entries on get', () => {
    vi.useFakeTimers()
    const user = { id: 1, name: 'test' }
    cache.set('session-1', user, 60_000)
    expect(cache.get('session-1')).toEqual(user)

    vi.advanceTimersByTime(61_000)
    expect(cache.get('session-1')).toBeNull()
    vi.useRealTimers()
  })

  it('deletes entries', () => {
    cache.set('session-1', { id: 1, name: 'test' }, 60_000)
    cache.delete('session-1')
    expect(cache.get('session-1')).toBeNull()
  })

  it('clears all entries', () => {
    cache.set('s1', { id: 1, name: 'a' }, 60_000)
    cache.set('s2', { id: 2, name: 'b' }, 60_000)
    expect(cache.size).toBe(2)
    cache.clear()
    expect(cache.size).toBe(0)
    expect(cache.get('s1')).toBeNull()
    expect(cache.get('s2')).toBeNull()
  })

  it('reports size correctly including expired entries', () => {
    vi.useFakeTimers()
    cache.set('s1', { id: 1, name: 'a' }, 60_000)
    cache.set('s2', { id: 2, name: 'b' }, 60_000)
    expect(cache.size).toBe(2)

    vi.advanceTimersByTime(61_000)
    expect(cache.size).toBe(2)
    cache.get('s1')
    expect(cache.size).toBe(1)
    vi.useRealTimers()
  })

  it('handles different TTL values per entry', () => {
    vi.useFakeTimers()
    cache.set('short', { id: 1, name: 'short' }, 10_000)
    cache.set('long', { id: 2, name: 'long' }, 120_000)

    vi.advanceTimersByTime(11_000)
    expect(cache.get('short')).toBeNull()
    expect(cache.get('long')).toEqual({ id: 2, name: 'long' })
    vi.useRealTimers()
  })
})