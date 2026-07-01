export interface ScheduleItem {
  id: string
  time: string
  meridiem: string
  client: string
  initials: string
  service: string
  detail: string
  staff: string
  price: string
  status: 'Confirmed' | 'Checked in' | 'In progress'
  accent: string
}

export const schedule: ScheduleItem[] = [
  {
    id: '1',
    time: '9:00',
    meridiem: 'AM',
    client: 'Olivia Bennett',
    initials: 'OB',
    service: 'Airport Transfer',
    detail: 'Sedan',
    staff: 'Damon C.',
    price: '$140',
    status: 'Confirmed',
    accent: 'bg-rose-400',
  },
  {
    id: '2',
    time: '9:45',
    meridiem: 'AM',
    client: 'James Park',
    initials: 'JP',
    service: 'Hourly Chauffeur',
    detail: 'SUV',
    staff: 'Mateo A.',
    price: '',
    status: 'Checked in',
    accent: 'bg-emerald-400',
  },
  {
    id: '3',
    time: '10:30',
    meridiem: 'AM',
    client: 'Sofia Rossi',
    initials: 'SR',
    service: 'Sunset Yacht Tour',
    detail: '3h',
    staff: 'Leo O.',
    price: '$190',
    status: 'In progress',
    accent: 'bg-amber-400',
  },
  {
    id: '4',
    time: '1:00',
    meridiem: 'PM',
    client: 'Emma Davis',
    initials: 'ED',
    service: 'City Tour',
    detail: '2h',
    staff: 'Damon C.',
    price: '$320',
    status: 'Confirmed',
    accent: 'bg-yellow-400',
  },
]

export interface Confirmation {
  id: string
  name: string
  initials: string
  detail: string
  color: string
}

export const confirmations: Confirmation[] = [
  { id: '1', name: 'Ava Walsh', initials: 'AW', detail: 'Sunset Yacht Tour · Sat 11:00', color: 'bg-amber-200 text-amber-900' },
  { id: '2', name: 'Noah Williams', initials: 'NW', detail: 'Airport Transfer · Sat 14:30', color: 'bg-indigo-200 text-indigo-900' },
  { id: '3', name: 'Liam Carter', initials: 'LC', detail: 'Hourly Chauffeur · Sun 09:00', color: 'bg-rose-200 text-rose-900' },
  { id: '4', name: 'Grace Kim', initials: 'GK', detail: 'City Tour · Sun 16:00', color: 'bg-sky-200 text-sky-900' },
  { id: '5', name: 'Ethan Cole', initials: 'EC', detail: 'Yacht Charter · Mon 12:00', color: 'bg-emerald-200 text-emerald-900' },
]

export interface Activity {
  id: string
  text: string
  actor: string
  time: string
  dot: string
}

export const activity: Activity[] = [
  { id: '1', actor: 'Emma Davis', text: 'paid a $200 deposit', time: '8 min ago', dot: 'bg-emerald-500' },
  { id: '2', actor: 'James Park', text: 'booked a yacht tour', time: '26 min ago', dot: 'bg-gold' },
  { id: '3', actor: 'Sofia Rossi', text: 'left a 5★ review', time: '1 hr ago', dot: 'bg-gold' },
  { id: '4', actor: 'Noah Williams', text: 'rescheduled to Saturday', time: '2 hr ago', dot: 'bg-sky-500' },
]

export const newClients = [
  { initials: 'EM', color: 'bg-rose-300 text-rose-900' },
  { initials: 'JP', color: 'bg-emerald-300 text-emerald-900' },
  { initials: 'SR', color: 'bg-indigo-300 text-indigo-900' },
]

export const revenueSparkline = [12, 18, 14, 22, 19, 26, 24, 30, 27, 34, 31, 38]

export const workspace = {
  name: 'Big Cadi VIP',
  detail: '6 chauffeurs · yacht & fleet',
}
