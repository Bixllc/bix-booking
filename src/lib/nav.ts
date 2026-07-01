import {
  LayoutGrid,
  Calendar,
  Users,
  BarChart3,
  Layers,
  Waypoints,
  FileText,
  CreditCard,
  UserRound,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'WORKSPACE',
    items: [
      { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
      { id: 'nav-calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
      { id: 'nav-clients', label: 'Clients', href: '/clients', icon: Users },
      { id: 'nav-analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'BUILD',
    items: [
      { id: 'nav-services', label: 'Services', href: '/services', icon: Layers },
      { id: 'nav-booking-flow', label: 'Booking flow', href: '/booking-flow', icon: Waypoints },
      { id: 'nav-forms', label: 'Forms', href: '/forms', icon: FileText },
    ],
  },
  {
    label: 'MANAGE',
    items: [
      { id: 'nav-payments', label: 'Payments', href: '/payments', icon: CreditCard },
      { id: 'nav-staff', label: 'Staff', href: '/staff', icon: UserRound },
      { id: 'nav-settings', label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]
