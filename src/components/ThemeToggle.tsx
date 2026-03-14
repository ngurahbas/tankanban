import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type ThemeMode = 'auto' | 'light' | 'dark'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeMode | null
    const initialMode = stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto'
    setMode(initialMode)
    applyTheme(initialMode)
  }, [])

  const applyTheme = (newMode: ThemeMode) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = newMode === 'auto' ? (prefersDark ? 'dark' : 'light') : newMode
    
    setResolvedTheme(resolved)
    
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
    
    if (newMode === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', newMode)
    }
  }

  const handleClick = () => {
    const nextMode: ThemeMode = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto'
    setMode(nextMode)
    localStorage.setItem('theme', nextMode)
    applyTheme(nextMode)
  }

  const getLabel = () => {
    switch (mode) {
      case 'auto':
        return 'Auto'
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
    }
  }

  const getIcon = () => {
    if (mode === 'auto') {
      return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
    }
    return mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] dark:text-[var(--sea-ink)] dark:hover:bg-[var(--link-bg-hover)]"
    >
      <span className="flex items-center gap-2">
        {getIcon()}
        Theme
      </span>
      <span className="text-xs text-[var(--sea-ink-soft)]">{getLabel()}</span>
    </button>
  )
}
