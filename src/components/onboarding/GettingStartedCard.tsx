import { ChevronDown, ChevronRight, Check, RotateCcw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding, TOUR_STEPS } from '../../context/OnboardingContext'
import { ProgressRing } from '../ui/ProgressRing'

export function GettingStartedCard() {
  const {
    welcomeOpen,
    tourActive,
    completed,
    checklistOpen,
    checklistDismissed,
    toggleChecklist,
    dismissChecklist,
    completeStep,
    replayTour,
  } = useOnboarding()
  const navigate = useNavigate()

  const doneCount = completed.size
  const allDone = doneCount === TOUR_STEPS.length

  if (welcomeOpen || tourActive || checklistDismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 rounded-card bg-surface shadow-2xl border border-border animate-scrIn">
      <div className="flex items-center gap-3 p-4">
        <ProgressRing progress={doneCount / TOUR_STEPS.length} label={`${doneCount}/${TOUR_STEPS.length}`} />
        <div className="min-w-0 flex-1">
          <div className="text-body font-bold text-ink">Getting started</div>
          <div className="text-[12px] text-muted">
            {allDone ? "You're all set" : `${TOUR_STEPS.length - doneCount} steps left to go live`}
          </div>
        </div>
        {allDone ? (
          <button type="button" onClick={dismissChecklist} className="shrink-0 text-faint hover:text-muted transition" aria-label="Dismiss">
            <X size={16} strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleChecklist}
            className="shrink-0 text-faint hover:text-muted transition"
            aria-label={checklistOpen ? 'Collapse' : 'Expand'}
          >
            <ChevronDown size={18} strokeWidth={1.8} className={checklistOpen ? '' : '-rotate-90 transition-transform'} />
          </button>
        )}
      </div>

      {checklistOpen && (
        <div className="border-t border-border px-2 pb-2">
          {TOUR_STEPS.map((step) => {
            const done = completed.has(step.id)
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  completeStep(step.id)
                  navigate(step.route)
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-btn hover:bg-canvas transition text-left"
              >
                <span
                  className={[
                    'size-4 shrink-0 rounded-full border flex items-center justify-center transition',
                    done ? 'bg-ink border-ink' : 'border-border-2',
                  ].join(' ')}
                >
                  {done && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>
                <span className={`flex-1 text-[13px] ${done ? 'text-faint line-through' : 'text-ink font-medium'}`}>
                  {step.title}
                </span>
                <ChevronRight size={15} strokeWidth={1.7} className="text-faint shrink-0" />
              </button>
            )
          })}

          <button
            type="button"
            onClick={replayTour}
            className="mt-1 w-full flex items-center justify-center gap-2 rounded-btn border border-border py-2.5 text-label font-medium text-ink hover:bg-canvas transition"
          >
            <RotateCcw size={14} strokeWidth={1.8} />
            Replay full tour
          </button>
        </div>
      )}
    </div>
  )
}
