import { NavLink, useNavigate } from 'react-router-dom'
import { Eye, LogOut, Plus } from 'lucide-react'
import { BixMark } from '../ui/BixMark'
import { navGroups } from '../../lib/nav'
import { useOnboarding } from '../../context/OnboardingContext'
import { useAuth } from '../../context/AuthContext'

export function Sidebar() {
  const { currentStep, tourActive, mobileNavOpen, closeMobileNav } = useOnboarding()
  const { workspace, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileNavOpen && !tourActive && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobileNav}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={[
          'w-sidebar shrink-0 h-full bg-surface border-r border-border flex flex-col',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:static md:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="h-header shrink-0 px-5 flex items-center gap-2.5">
          <span className="text-indigo-500">
            <BixMark size={24} />
          </span>
          <span className="text-wordmark text-ink">Bix</span>
          <span className="ml-auto rounded-chip border border-border-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-2">
            PRO
          </span>
        </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-2 pb-4 flex flex-col gap-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 font-mono text-meta uppercase text-faint">{group.label}</div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isSpotlit = currentStep?.targetId === item.id
                return (
                  <NavLink
                    key={item.id}
                    id={item.id}
                    to={item.href}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-2.5 rounded-btn px-3 py-2.5 text-label transition-[filter,background-color] duration-150',
                        isActive
                          ? 'bg-ink text-white'
                          : 'text-ink/80 hover:bg-canvas hover:brightness-[.97]',
                        isSpotlit ? 'ring-2 ring-gold ring-offset-2 ring-offset-surface relative z-50' : '',
                      ].join(' ')
                    }
                  >
                    <Icon size={18} strokeWidth={1.7} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 flex flex-col gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-btn border border-gold-soft text-gold bg-surface px-3 py-2.5 text-label font-semibold hover:brightness-[.97] transition"
        >
          <Plus size={16} strokeWidth={2} />
          New booking
        </button>

        <a
          id="view-booking-page"
          href={workspace ? `/book/${workspace.slug}` : '#'}
          target="_blank"
          rel="noreferrer"
          className={[
            'flex items-center gap-2 rounded-btn px-3 py-2.5 text-label font-medium text-ink transition',
            'bg-gold-soft/40 hover:brightness-[.97]',
            currentStep?.targetId === 'view-booking-page' ? 'ring-2 ring-gold ring-offset-2 ring-offset-surface relative z-50' : '',
          ].join(' ')}
        >
          <Eye size={16} strokeWidth={1.7} />
          View booking page
        </a>

        <div className="flex items-center gap-3 rounded-btn bg-canvas px-3 py-2.5">
          <div className="size-9 shrink-0 rounded-avatar bg-ink-grad" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-label font-semibold text-ink">{workspace?.name ?? 'Loading…'}</div>
            <div className="truncate text-[11px] text-muted">/{workspace?.slug}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 text-faint hover:text-muted transition"
            aria-label="Log out"
          >
            <LogOut size={14} strokeWidth={1.7} />
          </button>
        </div>
      </div>
      </aside>
    </>
  )
}
