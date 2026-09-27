// =============================================================================
// Layout — page shell wrapping all routes
// =============================================================================

import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from './Navbar'
import { ContractStatusBanner } from './ContractStatusBanner'

export function Layout() {
  return (
    <div className="layout">
      <ContractStatusBanner />
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span>Built on <strong>Midnight Protocol</strong> · Zero-Knowledge Privacy</span>
          <a
            href="https://github.com/gourish02/Anonymous-Crime-Reporting"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub ↗
          </a>
        </div>
      </footer>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1e2e',
            color: '#cdd6f4',
            border: '1px solid #313244',
            borderRadius: '12px',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  )
}
