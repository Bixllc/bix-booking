import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../hooks/useBookings'
import { useStaff } from '../hooks/useStaff'
import { addDaysToDateString, dateStringToNoonUtc, daysInMonth, weekdayOfDateString } from '../lib/dates'
import { localDateKeyOf } from '../lib/formatTime'
import type { Booking } from '../lib/api/types'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { BookingDetailModal } from '../components/calendar/BookingDetailModal'

type ViewMode = 'day' | 'week' | 'month'

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function weekStartOf(dateStr: string): string {
  return addDaysToDateString(dateStr, -weekdayOfDateString(dateStr))
}

function monthGrid(dateStr: string): { cells: Array<{ date: string; inMonth: boolean }>; gridStart: string; gridEnd: string } {
  const [year, month] = dateStr.split('-').map(Number)
  const firstOfMonth = `${dateStr.slice(0, 7)}-01`
  const leading = weekdayOfDateString(firstOfMonth)
  const totalDaysInMonth = daysInMonth(year, month)
  const totalCells = Math.ceil((leading + totalDaysInMonth) / 7) * 7
  const gridStart = addDaysToDateString(firstOfMonth, -leading)

  const cells = Array.from({ length: totalCells }).map((_, i) => {
    const date = addDaysToDateString(gridStart, i)
    return { date, inMonth: date.slice(0, 7) === dateStr.slice(0, 7) }
  })

  return { cells, gridStart, gridEnd: cells[cells.length - 1].date }
}

function shiftAnchor(view: ViewMode, anchor: string, dir: 1 | -1): string {
  if (view === 'day') return addDaysToDateString(anchor, dir)
  if (view === 'week') return addDaysToDateString(anchor, dir * 7)
  const [year, month, day] = anchor.split('-').map(Number)
  const nextMonth = month + dir
  const d = new Date(Date.UTC(year, nextMonth - 1, day))
  return d.toISOString().slice(0, 10)
}

export function Calendar() {
  const { workspace } = useAuth()
  const timezone = workspace?.timezone ?? 'UTC'
  const currency = workspace?.currency ?? 'USD'

  const [view, setView] = useState<ViewMode>('week')
  const [anchor, setAnchor] = useState(todayDateString)
  const [staffId, setStaffId] = useState<string>('all')
  const [selected, setSelected] = useState<Booking | null>(null)

  const { data: staffData } = useStaff()
  const staff = staffData?.staff ?? []
  const todayKey = todayDateString()

  const range = useMemo((): {
    days: string[]
    cells: Array<{ date: string; inMonth: boolean }>
    fetchFrom: string
    fetchTo: string
  } => {
    if (view === 'day') {
      return { days: [anchor], cells: [], fetchFrom: addDaysToDateString(anchor, -1), fetchTo: addDaysToDateString(anchor, 2) }
    }
    if (view === 'week') {
      const start = weekStartOf(anchor)
      const days = Array.from({ length: 7 }).map((_, i) => addDaysToDateString(start, i))
      return { days, cells: [], fetchFrom: addDaysToDateString(start, -1), fetchTo: addDaysToDateString(start, 8) }
    }
    const { cells, gridStart, gridEnd } = monthGrid(anchor)
    return { days: [], cells, fetchFrom: addDaysToDateString(gridStart, -1), fetchTo: addDaysToDateString(gridEnd, 1) }
  }, [view, anchor])

  const { data, isLoading } = useBookings({
    from: `${range.fetchFrom}T00:00:00.000Z`,
    to: `${range.fetchTo}T00:00:00.000Z`,
    staffId: staffId === 'all' ? undefined : staffId,
  })
  const bookings = (data?.bookings ?? []).filter((b) => b.status !== 'cancelled')

  const label = useMemo(() => {
    if (view === 'day') {
      return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(
        dateStringToNoonUtc(anchor),
      )
    }
    if (view === 'week') {
      const start = range.days[0]
      const end = range.days[range.days.length - 1]
      const startFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(dateStringToNoonUtc(start))
      const endFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(
        dateStringToNoonUtc(end),
      )
      return `${startFmt} – ${endFmt}`
    }
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(dateStringToNoonUtc(anchor))
  }, [view, anchor, range])

  const dayBookings = view === 'day' ? bookings.filter((b) => localDateKeyOf(b.startAt, timezone) === anchor) : []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Calendar</h1>
          <p className="text-body text-muted mt-0.5">Every booking, day by day.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={[
                'rounded-btn px-3 py-1.5 text-label font-medium transition capitalize',
                view === v ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftAnchor(view, a, -1))}
            className="size-8 rounded-btn border border-border flex items-center justify-center text-ink hover:bg-canvas transition"
            aria-label="Previous"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(todayDateString())}
            className="rounded-btn border border-border px-3 py-1.5 text-label font-medium text-ink hover:bg-canvas transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftAnchor(view, a, 1))}
            className="size-8 rounded-btn border border-border flex items-center justify-center text-ink hover:bg-canvas transition"
            aria-label="Next"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
          <span className="text-body font-semibold text-ink ml-1">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setStaffId('all')}
            className={[
              'shrink-0 rounded-btn px-3 py-1.5 text-label font-medium transition',
              staffId === 'all' ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
            ].join(' ')}
          >
            All staff
          </button>
          {staff.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStaffId(s.id)}
              className={[
                'shrink-0 flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-label font-medium transition',
                staffId === s.id ? 'bg-ink text-white' : 'border border-border text-ink hover:bg-canvas',
              ].join(' ')}
            >
              <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-body text-muted">Loading calendar…</p>}

      {!isLoading && view === 'month' && (
        <MonthView
          cells={range.cells}
          bookings={bookings}
          timezone={timezone}
          todayKey={todayKey}
          onSelectBooking={setSelected}
          onSeeMore={(date) => {
            setAnchor(date)
            setView('day')
          }}
        />
      )}

      {!isLoading && view === 'week' && (
        <WeekView days={range.days} bookings={bookings} timezone={timezone} currency={currency} todayKey={todayKey} onSelectBooking={setSelected} />
      )}

      {!isLoading && view === 'day' && (
        <DayView bookings={dayBookings} timezone={timezone} currency={currency} onSelectBooking={setSelected} />
      )}

      {selected && (
        <BookingDetailModal booking={selected} timezone={timezone} currency={currency} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
