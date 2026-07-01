import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { WelcomeModal } from '../onboarding/WelcomeModal'
import { GuidedTour } from '../onboarding/GuidedTour'
import { GettingStartedCard } from '../onboarding/GettingStartedCard'

export function AppShell() {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-canvas">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <Outlet />
        </div>
      </main>

      <WelcomeModal />
      <GuidedTour />
      <GettingStartedCard />
    </div>
  )
}
