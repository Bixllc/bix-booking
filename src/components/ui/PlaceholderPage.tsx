import type { LucideIcon } from 'lucide-react'

interface PlaceholderPageProps {
  icon: LucideIcon
  title: string
  description: string
}

export function PlaceholderPage({ icon: Icon, title, description }: PlaceholderPageProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-scrIn">
      <div className="size-14 rounded-card bg-surface border border-border flex items-center justify-center mb-5">
        <Icon size={24} strokeWidth={1.5} className="text-gold" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-1.5">{title}</h2>
      <p className="text-body text-muted max-w-sm">{description}</p>
    </div>
  )
}
