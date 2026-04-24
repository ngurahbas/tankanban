import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { logout } from '../lib/auth.ts'
import { useNavigate } from '@tanstack/react-router'
import { ThemeToggle } from './ThemeToggle.tsx'

interface MainPanelProps {
  onMenuToggle: () => void
  user?: {
    id: number
    authValue: string
  } | null
}

export default function MainPanel({ onMenuToggle, user }: MainPanelProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close menu when clicking outside
  useEffect(() => {
    let mounted = true

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (mounted) setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      mounted = false
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  // Truncate email for mobile display
  const truncateEmail = (email: string, maxLength: number = 12) => {
    if (email.length <= maxLength) return email
    const atIndex = email.indexOf('@')
    if (atIndex === -1) return email.slice(0, maxLength) + '...'
    return email.slice(0, Math.min(atIndex, maxLength)) + '...'
  }

  const displayEmail = user ? user.authValue : ''
  const truncatedEmail = user ? truncateEmail(user.authValue) : ''

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 flex items-center justify-between border-t border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-lg sm:bottom-auto sm:top-0 sm:border-t-0 sm:border-b">
      <button
        onClick={onMenuToggle}
        className="order-2 rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:order-1"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {user && (
        <div className="relative order-1 sm:order-2" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
          >
            <span className="hidden sm:inline">{displayEmail}</span>
            <span className="sm:hidden max-w-[100px] truncate">{truncatedEmail}</span>
            <svg
              className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-64 rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] py-1 shadow-lg backdrop-blur-sm dark:bg-slate-800 sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2">
              <div className="px-4 py-2 text-sm font-medium text-[var(--sea-ink)] border-b border-[var(--line)]">
                {displayEmail}
              </div>
              <div className="py-1">
                <ThemeToggle />
              </div>
              <div className="border-t border-[var(--line)] py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-[var(--link-bg-hover)] dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
