import { Menu } from 'lucide-react'

interface MainPanelProps {
  onMenuToggle: () => void
}

export default function MainPanel({ onMenuToggle }: MainPanelProps) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 border-t border-[var(--line)] bg-[var(--header-bg)] px-4 py-3 backdrop-blur-lg sm:bottom-auto sm:top-0 sm:border-t-0 sm:border-b">
      <button
        onClick={onMenuToggle}
        className="ml-auto block rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:ml-0 sm:mr-auto"
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </div>
  )
}
