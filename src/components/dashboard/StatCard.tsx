import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  badge?: ReactNode
  accent?: boolean
  children?: ReactNode
  footer?: ReactNode
}

export function StatCard({ label, value, badge, accent, children, footer }: StatCardProps) {
  return (
    <div
      className={[
        'rounded-card border p-5 flex flex-col gap-4 animate-scrIn',
        accent ? 'bg-gold-soft/25 border-gold-soft' : 'bg-surface border-border',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body text-muted">{label}</span>
        {badge}
      </div>
      <div className="text-stat text-ink leading-none">{value}</div>
      {children}
      {footer}
    </div>
  )
}
