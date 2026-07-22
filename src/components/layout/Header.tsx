import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext'
import { useAuth } from '../../context/AuthContext'
import { useDashboardStats } from '../../hooks/useDashboardStats'

function useGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

interface HeaderProps {
  onNewBooking?: () => void
}

export function Header({ onNewBooking }: HeaderProps) {
  const greeting = useGreeting()
  const { openMobileNav } = useOnboarding()
  const { user } = useAuth()
  const { data: stats } = useDashboardStats()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const firstName = user?.name.split(' ')[0] ?? ''

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    navigate(search.trim() ? `/clients?q=${encodeURIComponent(search.trim())}` : '/clients')
  }

  return (
    <header className="h-header shrink-0 bg-surface border-b border-border flex items-center gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={openMobileNav}
        aria-label="Open menu"
        className="shrink-0 md:hidden text-ink hover:bg-canvas rounded-btn p-2 -ml-2 transition"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      <div className="min-w-0">
        <h1 className="text-lead text-ink truncate">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="hidden sm:block font-mono text-[12px] text-muted mt-0.5 truncate">
          {dateLabel}
          {stats ? ` · ${stats.appointments.completed} of ${stats.appointments.total} appointments done` : ''}
        </p>
      </div>

      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3">
        <form
          onSubmit={submitSearch}
          className="hidden md:flex w-full max-w-[340px] items-center gap-2 rounded-field border border-border bg-canvas px-3.5 py-2.5 text-muted focus-within:border-gold transition"
        >
          <Search size={16} strokeWidth={1.7} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="flex-1 min-w-0 bg-transparent text-body text-ink placeholder:text-faint outline-none"
          />
        </form>

        <button
          type="button"
          onClick={() => navigate('/clients')}
          aria-label="Search clients"
          className="md:hidden shrink-0 rounded-btn border border-border p-2.5 text-muted hover:bg-canvas transition"
        >
          <Search size={17} strokeWidth={1.7} />
        </button>

        <button
          type="button"
          onClick={onNewBooking}
          className="shrink-0 flex items-center gap-2 rounded-btn bg-ink-grad px-3 sm:px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          <span className="hidden sm:inline">New booking</span>
        </button>
      </div>
    </header>
  )
}
