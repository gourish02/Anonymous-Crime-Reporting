// =============================================================================
// App.tsx — React Router v6 application with all routes
// =============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { Layout }     from '@/components/Layout'
import { HomePage }           from '@/pages/HomePage'
import { ConnectWalletPage }  from '@/pages/ConnectWalletPage'
import { SubmitReportPage }   from '@/pages/SubmitReportPage'
import { VerificationPage }   from '@/pages/VerificationPage'
import { ReportHistoryPage }  from '@/pages/ReportHistoryPage'
import { AIClassifierPage }   from '@/pages/AIClassifierPage'
import { VolunteerVerificationPage } from '@/pages/VolunteerVerificationPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index              element={<HomePage />}          />
            <Route path="/connect"    element={<ConnectWalletPage />} />
            <Route path="/submit"     element={<SubmitReportPage />}  />
            <Route path="/verify"     element={<VerificationPage />}  />
            <Route path="/history"    element={<ReportHistoryPage />} />
            <Route path="/classifier" element={<AIClassifierPage />}  />
            <Route path="/volunteer"  element={<VolunteerVerificationPage />} />
            {/* Catch-all */}
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
