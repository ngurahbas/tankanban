import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InlineEdit } from './inline-edit'

describe('InlineEdit', () => {
  it('displays value when not editing', () => {
    render(<InlineEdit value="Hello" onSave={vi.fn()} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('shows placeholder when value is empty', () => {
    render(<InlineEdit value="" onSave={vi.fn()} placeholder="Add text..." />)
    expect(screen.getByText('Add text...')).toBeInTheDocument()
  })

  it('enters edit mode on click', () => {
    render(<InlineEdit value="Test" onSave={vi.fn()} />)
    fireEvent.click(screen.getByText('Test'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('saves on blur when value changed', () => {
    const onSave = vi.fn()
    render(<InlineEdit value="Original" onSave={onSave} />)
    fireEvent.click(screen.getByText('Original'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Updated' } })
    fireEvent.blur(input)
    expect(onSave).toHaveBeenCalledWith('Updated')
  })

  it('does not save on blur when value unchanged', () => {
    const onSave = vi.fn()
    render(<InlineEdit value="Same" onSave={onSave} />)
    fireEvent.click(screen.getByText('Same'))
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('cancels on Escape', () => {
    const onSave = vi.fn()
    render(<InlineEdit value="Original" onSave={onSave} />)
    fireEvent.click(screen.getByText('Original'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Changed' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.getByText('Original')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves on Enter in single-line mode', () => {
    const onSave = vi.fn()
    render(<InlineEdit value="Test" onSave={onSave} />)
    fireEvent.click(screen.getByText('Test'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSave).toHaveBeenCalledWith('New')
  })

  it('uses textarea in multiline mode', () => {
    render(<InlineEdit value="Text" onSave={vi.fn()} multiline />)
    fireEvent.click(screen.getByText('Text'))
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3')
  })

  it('does not save on Enter in multiline mode', () => {
    const onSave = vi.fn()
    render(<InlineEdit value="Line1" onSave={onSave} multiline />)
    fireEvent.click(screen.getByText('Line1'))
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Line2' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSave).not.toHaveBeenCalled()
  })
})