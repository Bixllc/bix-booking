import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { OnboardingProvider } from './context/OnboardingContext'
import { Dashboard } from './pages/Dashboard'
import { Calendar } from './pages/Calendar'
import { Clients } from './pages/Clients'
import { Analytics } from './pages/Analytics'
import { Services } from './pages/Services'
import { BookingFlow } from './pages/BookingFlow'
import { Forms } from './pages/Forms'
import { Payments } from './pages/Payments'
import { Staff } from './pages/Staff'
import { Settings } from './pages/Settings'

function App() {
  return (
    <OnboardingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="clients" element={<Clients />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="services" element={<Services />} />
            <Route path="booking-flow" element={<BookingFlow />} />
            <Route path="forms" element={<Forms />} />
            <Route path="payments" element={<Payments />} />
            <Route path="staff" element={<Staff />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OnboardingProvider>
  )
}

export default App
