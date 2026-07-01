import { useOnboarding } from '../../context/OnboardingContext'
import { BixMark } from '../ui/BixMark'

export function WelcomeModal() {
  const { welcomeOpen, startSetup, skipWelcome } = useOnboarding()

  if (!welcomeOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md rounded-card bg-surface p-6 sm:p-8 text-center animate-scrIn shadow-2xl">
        <div className="mx-auto mb-6 size-16 rounded-card bg-ink-grad flex items-center justify-center">
          <BixMark size={30} className="text-indigo-400" />
        </div>

        <h2 className="text-2xl font-extrabold text-ink mb-3">Welcome to Bix</h2>
        <p className="text-body text-muted leading-relaxed mb-7">
          Let's get Big Cadi VIP ready to take bookings. Six quick steps — about two minutes — and your booking page
          is live.
        </p>

        <button
          type="button"
          onClick={startSetup}
          className="w-full rounded-btn bg-ink-grad py-3.5 text-base2 font-bold text-white hover:brightness-110 transition"
        >
          Start setup
        </button>
        <button
          type="button"
          onClick={skipWelcome}
          className="mt-4 text-label font-medium text-muted hover:text-ink transition"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
