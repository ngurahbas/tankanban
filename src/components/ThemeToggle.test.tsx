import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.removeAttribute('data-theme')
    vi.clearAllMocks()
  })

  it('starts in auto mode by default', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('Auto')).toBeInTheDocument()
  })

  it('cycles theme: auto → light → dark → auto', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(screen.getByText('Light')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.getByText('Dark')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.getByText('Auto')).toBeInTheDocument()
  })

  it('persists light theme to localStorage', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('persists dark theme to localStorage', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button) // auto → light
    fireEvent.click(button) // light → dark
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('restores theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark')
    
    render(<ThemeToggle />)
    expect(screen.getByText('Dark')).toBeInTheDocument()
  })

  })