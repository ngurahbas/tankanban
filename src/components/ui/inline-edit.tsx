import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Input } from './input'
import { Textarea } from './textarea'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  multiline?: boolean
  className?: string
  placeholder?: string
}

export function InlineEdit({
  value,
  onSave,
  multiline = false,
  className = '',
  placeholder = 'Click to edit',
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
        const len = editValue.length
        inputRef.current.setSelectionRange(len, len)
      } else if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline, editValue.length])

  useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = () => {
    if (editValue.trim() !== value.trim()) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (!isEditing) {
    return (
      <div
        onClick={handleStartEdit}
        className={`cursor-pointer hover:bg-[var(--link-bg-hover)] rounded px-1 -mx-1 transition ${className}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleStartEdit()
          }
        }}
      >
        {value || <span className="text-[var(--sea-ink-soft)] italic">{placeholder}</span>}
      </div>
    )
  }

  if (multiline) {
    return (
      <Textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className}`}
        rows={3}
      />
    )
  }

  return (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={`${className}`}
    />
  )
}
