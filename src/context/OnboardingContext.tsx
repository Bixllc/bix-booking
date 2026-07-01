import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export interface TourStep {
  id: string
  title: string
  body: string
  targetId: string
  route: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'add-service',
    title: 'Add your first service',
    body: 'Define what clients can book — chauffeur hours, yacht charters, airport transfers — with pricing and duration.',
    targetId: 'nav-services',
    route: '/services',
  },
  {
    id: 'booking-flow',
    title: 'Build your booking flow',
    body: 'Choose the steps clients walk through: service, date, add-ons, and confirmation.',
    targetId: 'nav-booking-flow',
    route: '/booking-flow',
  },
  {
    id: 'availability',
    title: 'Set availability & capacity',
    body: 'Tell Bix when your fleet and crew are free so double-bookings never happen.',
    targetId: 'nav-calendar',
    route: '/calendar',
  },
  {
    id: 'payments',
    title: 'Payment & cancellation policies',
    body: 'Turn on deposits, set cancellation windows, and connect payouts.',
    targetId: 'nav-payments',
    route: '/payments',
  },
  {
    id: 'team',
    title: 'Add your team',
    body: 'Invite chauffeurs and crew so bookings can be assigned automatically.',
    targetId: 'nav-staff',
    route: '/staff',
  },
  {
    id: 'share',
    title: 'Share your booking page',
    body: 'Your public booking page is ready — share the link anywhere clients can find you.',
    targetId: 'view-booking-page',
    route: '/dashboard',
  },
]

interface OnboardingState {
  welcomeOpen: boolean
  tourActive: boolean
  tourStepIndex: number
  completed: Set<string>
  checklistOpen: boolean
  checklistDismissed: boolean
  mobileNavOpen: boolean
  startSetup: () => void
  skipWelcome: () => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  replayTour: () => void
  toggleChecklist: () => void
  dismissChecklist: () => void
  completeStep: (id: string) => void
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void
  currentStep: TourStep | null
}

const OnboardingContext = createContext<OnboardingState | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [welcomeOpen, setWelcomeOpen] = useState(true)
  const [tourActive, setTourActive] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [checklistOpen, setChecklistOpen] = useState(true)
  const [checklistDismissed, setChecklistDismissed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const startSetup = useCallback(() => {
    setWelcomeOpen(false)
    setTourActive(true)
    setTourStepIndex(0)
  }, [])

  const skipWelcome = useCallback(() => {
    setWelcomeOpen(false)
  }, [])

  const completeStep = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const nextStep = useCallback(() => {
    setTourStepIndex((idx) => {
      const step = TOUR_STEPS[idx]
      if (step) {
        setCompleted((prev) => new Set(prev).add(step.id))
      }
      if (idx >= TOUR_STEPS.length - 1) {
        setTourActive(false)
        return idx
      }
      return idx + 1
    })
  }, [])

  const prevStep = useCallback(() => {
    setTourStepIndex((idx) => Math.max(0, idx - 1))
  }, [])

  const endTour = useCallback(() => {
    setTourActive(false)
  }, [])

  const replayTour = useCallback(() => {
    setTourStepIndex(0)
    setTourActive(true)
    setChecklistOpen(true)
  }, [])

  const toggleChecklist = useCallback(() => {
    setChecklistOpen((v) => !v)
  }, [])

  const dismissChecklist = useCallback(() => {
    setChecklistDismissed(true)
  }, [])

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const toggleMobileNav = useCallback(() => setMobileNavOpen((v) => !v), [])

  const currentStep = tourActive ? TOUR_STEPS[tourStepIndex] ?? null : null

  const value = useMemo<OnboardingState>(
    () => ({
      welcomeOpen,
      tourActive,
      tourStepIndex,
      completed,
      checklistOpen,
      checklistDismissed,
      mobileNavOpen,
      startSetup,
      skipWelcome,
      nextStep,
      prevStep,
      endTour,
      replayTour,
      toggleChecklist,
      dismissChecklist,
      completeStep,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
      currentStep,
    }),
    [
      welcomeOpen,
      tourActive,
      tourStepIndex,
      completed,
      checklistOpen,
      checklistDismissed,
      mobileNavOpen,
      startSetup,
      skipWelcome,
      nextStep,
      prevStep,
      endTour,
      replayTour,
      toggleChecklist,
      dismissChecklist,
      completeStep,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
      currentStep,
    ],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
