// =============================================================================
// App.tsx — React Router v6 application with all routes
// =============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { Layout }     from '@/components/Layout'
import { HomePage }           from '@/pages/HomePage'
import { ConnectWalletPage }  from '@/pages/ConnectWalletPage'
import { CrimeReportingPortalPage } from '@/pages/CrimeReportingPortalPage'
import { SubmitReportPage }   from '@/pages/SubmitReportPage'
import { VerificationPage }   from '@/pages/VerificationPage'
import { ReportHistoryPage }  from '@/pages/ReportHistoryPage'
import { AIClassifierPage }   from '@/pages/AIClassifierPage'
import { VolunteerVerificationPage } from '@/pages/VolunteerVerificationPage'
import { CredentialSubmissionPage }  from '@/pages/CredentialSubmissionPage'
import { VerificationResultPage }     from '@/pages/VerificationResultPage'
import { PublicSafetyDashboardPage }     from '@/pages/PublicSafetyDashboardPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index                     element={<HomePage />}                       />
            <Route path="/connect"           element={<ConnectWalletPage />}              />
            {/* Crime Reporting module pages */}
            <Route path="/crime"             element={<CrimeReportingPortalPage />}       />
            <Route path="/submit"            element={<SubmitReportPage />}               />
            <Route path="/verify"            element={<VerificationPage />}               />
            <Route path="/history"           element={<ReportHistoryPage />}              />
            <Route path="/classifier"        element={<AIClassifierPage />}               />
            {/* Confidential Volunteer Verification module pages */}
            <Route path="/volunteer"         element={<VolunteerVerificationPage />}      />
            <Route path="/volunteer/verify"  element={<VolunteerVerificationPage />}      />
            <Route path="/volunteer/submit"  element={<CredentialSubmissionPage />}       />
            <Route path="/volunteer/result"  element={<VerificationResultPage />}         />
            {/* Public Safety Dashboard */}
            <Route path="/dashboard"         element={<PublicSafetyDashboardPage />}      />
            <Route path="/safety-dashboard"  element={<PublicSafetyDashboardPage />}      />
            {/* Catch-all */}
            <Route path="*"                  element={<Navigate to="/" replace />}        />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
