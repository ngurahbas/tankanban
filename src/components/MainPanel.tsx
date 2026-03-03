import { Menu } from 'lucide-react'

interface MainPanelProps {
  onMenuToggle: () => void
}

export default function MainPanel({ onMenuToggle }: MainPanelProps) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-lg sm:bottom-auto sm:left-0 sm:right-auto sm:top-0 sm:h-screen sm:w-16 sm:border-b-0 sm:border-r sm:px-2 sm:py-4">
      <button
        onClick={onMenuToggle}
        className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:mx-auto sm:block"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  )
}
