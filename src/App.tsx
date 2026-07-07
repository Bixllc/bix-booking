import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/layout/RequireAuth'
import { OnboardingProvider } from './context/OnboardingContext'
import { AuthProvider } from './context/AuthContext'
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
import { Login } from './pages/Login'
import { PublicBooking } from './pages/PublicBooking'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="login" element={<Login />} />
              <Route path="book/:slug" element={<PublicBooking />} />

              <Route element={<RequireAuth />}>
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
              </Route>
            </Routes>
          </BrowserRouter>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
