// =============================================================================
// ContractStatusBanner — Displays user-friendly warning if contract address is missing
// =============================================================================

import { useState } from 'react'
import { AlertTriangle, X, ExternalLink, HelpCircle } from 'lucide-react'
import { contractAddress, isContractConfigured } from '@/config/networks'

export function ContractStatusBanner() {
  const [dismissed, setDismissed] = useState(false)
  const isConfigured = isContractConfigured(contractAddress)

  if (isConfigured || dismissed) {
    return null
  }

  return (
    <div
      role="alert"
      style={{
        background: 'linear-gradient(90deg, rgba(243, 139, 168, 0.15), rgba(250, 179, 135, 0.15))',
        borderBottom: '1px solid rgba(243, 139, 168, 0.35)',
        padding: '10px 1.5rem',
        fontSize: '0.84rem',
        color: '#f5e0dc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <AlertTriangle size={18} color="#fab387" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#fab387' }}>Contract Not Configured:</strong>{' '}
          <code>VITE_CONTRACT_ADDRESS_PREPROD</code> is currently <code>{contractAddress}</code>.
          The SafeCity platform is operating in local cryptographic proof simulation mode.
          Set standard environment variable <code>VITE_CONTRACT_ADDRESS_PREPROD</code> in your Vercel Project Settings to link a live on-chain contract.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <a
          href="https://preprod.midnightexplorer.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#89b4fa',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          Midnight Explorer <ExternalLink size={12} />
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss warning"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a6adc8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
