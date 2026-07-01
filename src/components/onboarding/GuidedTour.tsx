import { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useOnboarding, TOUR_STEPS } from '../../context/OnboardingContext'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

export function GuidedTour() {
  const { tourActive, tourStepIndex, currentStep, nextStep, prevStep, endTour, openMobileNav, closeMobileNav } =
    useOnboarding()
  const navigate = useNavigate()
  const [rect, setRect] = useState<Rect | null>(null)
  const isMobile = useIsMobile()

  useLayoutEffect(() => {
    if (!currentStep) return
    navigate(currentStep.route)
  }, [currentStep, navigate])

  useEffect(() => {
    if (!tourActive) return
    if (isMobile) openMobileNav()
    return () => closeMobileNav()
  }, [tourActive, isMobile, openMobileNav, closeMobileNav])

  useLayoutEffect(() => {
    if (!currentStep) {
      setRect(null)
      return
    }

    const measure = () => {
      const el = document.getElementById(currentStep.targetId)
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    measure()
    const raf = requestAnimationFrame(measure)
    const drawerSettle = window.setTimeout(measure, isMobile ? 240 : 0)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(drawerSettle)
      window.removeEventListener('resize', measure)
    }
  }, [currentStep, tourStepIndex, isMobile])

  if (!tourActive || !currentStep || !rect) return null

  const pad = 8
  const spotlightStyle = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }

  const popoverTop = isMobile ? undefined : Math.min(rect.top, window.innerHeight - 260)
  const popoverLeft = isMobile ? undefined : Math.min(rect.left + rect.width + 20, window.innerWidth - 300)
  const mobilePlacement = rect.top < window.innerHeight / 2 ? 'bottom' : 'top'

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          boxShadow: '0 0 0 9999px rgba(5,5,6,0.55)',
          top: spotlightStyle.top,
          left: spotlightStyle.left,
          width: spotlightStyle.width,
          height: spotlightStyle.height,
          borderRadius: 12,
        }}
      />

      <div
        className={[
          'fixed z-[60] rounded-card bg-surface p-5 shadow-2xl animate-scrIn',
          isMobile
            ? `inset-x-4 w-auto ${mobilePlacement === 'bottom' ? 'bottom-4' : 'top-4'}`
            : 'w-72 transition-[top,left] duration-300',
        ].join(' ')}
        style={isMobile ? undefined : { top: popoverTop, left: popoverLeft }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-meta uppercase text-faint">
            Step {tourStepIndex + 1} of {TOUR_STEPS.length}
          </span>
          <button type="button" onClick={endTour} className="text-faint hover:text-muted transition" aria-label="Close tour">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <h3 className="text-base2 font-bold text-ink mb-1.5">{currentStep.title}</h3>
        <p className="text-[12.5px] text-muted leading-relaxed mb-5">{currentStep.body}</p>

        <div className="flex items-center gap-2">
          {tourStepIndex > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-btn border border-border px-3.5 py-2 text-label font-medium text-ink hover:bg-canvas transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 rounded-btn bg-ink-grad py-2 text-label font-semibold text-white hover:brightness-110 transition"
          >
            {tourStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
