import { Car, Ship, Clock3, Plus, MoreHorizontal } from 'lucide-react'

interface Service {
  id: string
  name: string
  category: string
  duration: string
  price: string
  active: boolean
  icon: typeof Car
}

const services: Service[] = [
  { id: '1', name: 'Airport Transfer', category: 'Chauffeur · Sedan', duration: '45 min', price: '$140', active: true, icon: Car },
  { id: '2', name: 'Hourly Chauffeur', category: 'Chauffeur · SUV', duration: 'Per hour', price: '$95', active: true, icon: Car },
  { id: '3', name: 'City Tour', category: 'Chauffeur · Sedan', duration: '2 hours', price: '$320', active: true, icon: Car },
  { id: '4', name: 'Sunset Yacht Tour', category: 'Yacht · 40ft', duration: '3 hours', price: '$1,900', active: true, icon: Ship },
  { id: '5', name: 'Full Day Charter', category: 'Yacht · 60ft', duration: '8 hours', price: '$6,500', active: false, icon: Ship },
  { id: '6', name: 'Corporate Event', category: 'Chauffeur · Fleet', duration: 'Custom', price: 'From $2,200', active: true, icon: Car },
]

export function Services() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Services</h1>
          <p className="text-body text-muted mt-0.5">What clients can book, priced and ready to go.</p>
        </div>
        <button
          type="button"
          className="self-start sm:self-auto flex items-center gap-2 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition"
        >
          <Plus size={16} strokeWidth={2} />
          Add service
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {services.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.id} className="rounded-card bg-surface border border-border p-5 flex flex-col gap-4 animate-scrIn">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.7} className="text-gold" />
                </div>
                <button type="button" className="text-faint hover:text-muted transition" aria-label="More options">
                  <MoreHorizontal size={18} strokeWidth={1.7} />
                </button>
              </div>

              <div>
                <h3 className="text-base2 font-bold text-ink">{s.name}</h3>
                <p className="text-[12px] text-muted mt-0.5">{s.category}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-[12px] text-muted">
                  <Clock3 size={13} strokeWidth={1.7} />
                  {s.duration}
                </div>
                <span className="text-body font-bold text-ink">{s.price}</span>
              </div>

              <span
                className={[
                  'self-start rounded-chip px-2 py-0.5 text-[11px] font-mono font-semibold',
                  s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-canvas text-muted',
                ].join(' ')}
              >
                {s.active ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
