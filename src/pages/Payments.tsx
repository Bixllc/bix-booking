import { ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react'

interface Transaction {
  id: string
  client: string
  service: string
  amount: string
  type: 'deposit' | 'payout'
  date: string
  status: 'Paid' | 'Pending'
}

const transactions: Transaction[] = [
  { id: '1', client: 'Emma Davis', service: 'City Tour deposit', amount: '$200.00', type: 'deposit', date: 'Jun 30', status: 'Paid' },
  { id: '2', client: 'James Park', service: 'Sunset Yacht Tour', amount: '$1,900.00', type: 'deposit', date: 'Jun 29', status: 'Paid' },
  { id: '3', client: 'Weekly payout', service: 'To Chase ···4821', amount: '$8,240.00', type: 'payout', date: 'Jun 28', status: 'Paid' },
  { id: '4', client: 'Sofia Rossi', service: 'Sunset Yacht Tour balance', amount: '$1,710.00', type: 'deposit', date: 'Jun 27', status: 'Pending' },
]

export function Payments() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Payments</h1>
        <p className="text-body text-muted mt-0.5">Deposits, payouts, and policies for Big Cadi VIP.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <span className="text-body text-muted">Available balance</span>
          <div className="text-stat text-ink mt-3">$14,920</div>
          <p className="text-[12px] text-muted mt-1">Next payout Jul 3</p>
        </div>
        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
          <span className="text-body text-muted">This month</span>
          <div className="text-stat text-ink mt-3">$62,180</div>
          <p className="text-[12px] text-emerald-600 mt-1">+18% vs last month</p>
        </div>
        <div className="rounded-card bg-surface border border-border p-4 sm:p-5 flex flex-col gap-3 animate-scrIn">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-avatar bg-canvas border border-border flex items-center justify-center">
              <CreditCard size={16} strokeWidth={1.7} className="text-gold" />
            </div>
            <div>
              <div className="text-body font-semibold text-ink">Chase ···4821</div>
              <div className="text-[11.5px] text-muted">Payout account</div>
            </div>
          </div>
          <button type="button" className="rounded-btn border border-border py-2 text-label font-medium text-ink hover:bg-canvas transition">
            Manage payouts
          </button>
        </div>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <h2 className="text-base2 font-bold text-ink mb-4">Recent transactions</h2>
        <div className="flex flex-col divide-y divide-border">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 sm:gap-4 py-3.5">
              <div
                className={[
                  'size-9 shrink-0 rounded-avatar flex items-center justify-center',
                  t.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-canvas text-muted',
                ].join(' ')}
              >
                {t.type === 'deposit' ? (
                  <ArrowDownLeft size={16} strokeWidth={1.8} />
                ) : (
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-body font-semibold text-ink truncate">{t.client}</div>
                <div className="text-[12px] text-muted truncate">{t.service}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-body font-semibold text-ink">{t.amount}</div>
                <div className="text-[11.5px] text-muted">{t.date}</div>
              </div>
              <span
                className={[
                  'shrink-0 rounded-chip px-2 py-0.5 text-[11px] font-mono font-semibold',
                  t.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
                ].join(' ')}
              >
                {t.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
