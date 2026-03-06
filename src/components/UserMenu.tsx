import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { logout } from '../lib/auth.ts'
import { Button } from './ui/button.tsx'

interface UserMenuProps {
  user: {
    id: number
    authValue: string
  } | null
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate({ to: '/login' })}>
        Sign In
      </Button>
    )
  }

  // Extract username from email
  const username = user.authValue.split('@')[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--link-bg-hover)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#56c6be] to-[#7ed3bf] text-white">
          {username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{username}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-[var(--line)] bg-white py-1 shadow-lg dark:bg-slate-800">
            <div className="border-b border-[var(--line)] px-4 py-2">
              <p className="text-sm font-medium">{user.authValue}</p>
              <p className="text-xs text-slate-500">Signed in with Google</p>
            </div>
            <Link
              to="/kanban"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              onClick={() => setIsOpen(false)}
            >
              My Boards
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-red-400 dark:hover:bg-slate-700"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
