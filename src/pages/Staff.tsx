import { Plus, Star } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  role: string
  initials: string
  color: string
  rating: string
  bookings: number
}

const staff: StaffMember[] = [
  { id: '1', name: 'Damon Carter', role: 'Chauffeur · Sedan & SUV', initials: 'DC', color: 'bg-rose-200 text-rose-900', rating: '4.9', bookings: 142 },
  { id: '2', name: 'Mateo Alvarez', role: 'Chauffeur · SUV', initials: 'MA', color: 'bg-sky-200 text-sky-900', rating: '4.8', bookings: 98 },
  { id: '3', name: 'Leo Ortiz', role: 'Yacht Captain', initials: 'LO', color: 'bg-indigo-200 text-indigo-900', rating: '5.0', bookings: 76 },
  { id: '4', name: 'Priya Nair', role: 'Chauffeur · Sedan', initials: 'PN', color: 'bg-emerald-200 text-emerald-900', rating: '4.9', bookings: 121 },
  { id: '5', name: 'Owen Blake', role: 'First Mate', initials: 'OB', color: 'bg-amber-200 text-amber-900', rating: '4.7', bookings: 54 },
  { id: '6', name: 'Nina Torres', role: 'Chauffeur · Fleet Lead', initials: 'NT', color: 'bg-purple-200 text-purple-900', rating: '4.9', bookings: 167 },
]

export function Staff() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Staff</h1>
          <p className="text-body text-muted mt-0.5">Chauffeurs and crew who get assigned to bookings.</p>
        </div>
        <button
          type="button"
          className="self-start sm:self-auto flex items-center gap-2 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          Invite team member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {staff.map((s) => (
          <div key={s.id} className="rounded-card bg-surface border border-border p-4 sm:p-5 flex items-center gap-3.5 animate-scrIn">
            <div className={`size-11 shrink-0 rounded-avatar flex items-center justify-center text-[12px] font-bold ${s.color}`}>
              {s.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-body font-semibold text-ink truncate">{s.name}</div>
              <div className="text-[12px] text-muted truncate">{s.role}</div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[11.5px] font-medium text-ink">
                  <Star size={12} strokeWidth={0} fill="#bf9a42" />
                  {s.rating}
                </span>
                <span className="font-mono text-[10.5px] text-faint">{s.bookings} bookings</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
