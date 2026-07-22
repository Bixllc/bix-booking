import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { initialsOf } from '../lib/formatTime'
import { colorForId } from '../lib/colors'

export function Clients() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const { data, isLoading } = useClients(query.trim() || undefined)
  const clients = data?.clients ?? []

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Clients</h1>
        <p className="text-body text-muted mt-0.5">Everyone who has booked with you.</p>
      </div>

      <div className="flex items-center gap-2 rounded-field border border-border bg-surface px-3.5 py-2.5 max-w-sm">
        <Search size={16} strokeWidth={1.7} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="flex-1 min-w-0 bg-transparent text-body text-ink placeholder:text-faint outline-none"
        />
      </div>

      {isLoading && <p className="text-body text-muted">Loading clients…</p>}

      {!isLoading && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={28} strokeWidth={1.5} className="text-faint mb-3" />
          <p className="text-body text-muted">{query ? 'No clients match your search.' : 'No clients yet.'}</p>
        </div>
      )}

      {clients.length > 0 && (
        <div className="rounded-card bg-surface border border-border animate-scrIn overflow-hidden">
          <div className="flex flex-col divide-y divide-border">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center gap-3.5 px-4 sm:px-5 py-3.5">
                <div className={`size-10 shrink-0 rounded-avatar flex items-center justify-center text-[12px] font-bold ${colorForId(c.id)}`}>
                  {initialsOf(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-body font-semibold text-ink truncate">{c.name}</div>
                  <div className="text-[12px] text-muted truncate">
                    {c.email}
                    {c.phone ? ` · ${c.phone}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
