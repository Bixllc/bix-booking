import { Plus, Search } from 'lucide-react'

function useGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

interface HeaderProps {
  name?: string
  onNewBooking?: () => void
}

export function Header({ name = 'Cadi', onNewBooking }: HeaderProps) {
  const greeting = useGreeting()
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="h-header shrink-0 bg-surface border-b border-border flex items-center gap-6 px-8">
      <div className="min-w-0">
        <h1 className="text-lead text-ink truncate">
          {greeting}, {name}
        </h1>
        <p className="font-mono text-[12px] text-muted mt-0.5 truncate">
          {dateLabel} &middot; 6 of 18 appointments done
        </p>
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        <div className="w-full max-w-[340px] flex items-center gap-2 rounded-field border border-border bg-canvas px-3.5 py-2.5 text-muted">
          <Search size={16} strokeWidth={1.7} />
          <input
            type="text"
            placeholder="Search clients, bookings..."
            className="flex-1 min-w-0 bg-transparent text-body text-ink placeholder:text-faint outline-none"
          />
          <span className="shrink-0 rounded-kbd border border-border-2 bg-surface px-1.5 py-0.5 text-kbd font-mono text-faint">
            ⌘K
          </span>
        </div>

        <button
          type="button"
          onClick={onNewBooking}
          className="shrink-0 flex items-center gap-2 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          New booking
        </button>
      </div>
    </header>
  )
}
