import { describe, it, expect } from 'vitest'
import { ForbiddenError } from './errors'

describe('ForbiddenError', () => {
  it('uses default message', () => {
    const error = new ForbiddenError()
    expect(error.message).toBe('Access denied')
    expect(error.name).toBe('ForbiddenError')
  })

  it('accepts custom message', () => {
    const error = new ForbiddenError('Not authorized')
    expect(error.message).toBe('Not authorized')
    expect(error.name).toBe('ForbiddenError')
  })

  it('is instance of Error', () => {
    const error = new ForbiddenError()
    expect(error).toBeInstanceOf(Error)
  })
})