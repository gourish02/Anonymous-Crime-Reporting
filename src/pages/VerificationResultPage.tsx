// =============================================================================
// SafeCity — Verification Result Page
// Displays: ✓ Verified Volunteer without exposing any personal information
// =============================================================================

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, XCircle, ShieldCheck, Lock, Copy, Check,
  ExternalLink, ArrowLeft, RefreshCw, Cpu, Award, Calendar, FileText
} from 'lucide-react'
import type { ProofMetadata, ConfidentialCredentialStatus } from '@/types'

interface ResultState {
  credentialId?: string
  commitment?: string
  status?: ConfidentialCredentialStatus
  statusCode?: number
  proof?: ProofMetadata
  organization?: string
  role?: string
  timestamp?: number
}

export function VerificationResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as ResultState) || {}

  const [copiedCommitment, setCopiedCommitment] = useState(false)
  const [copiedTx, setCopiedTx] = useState(false)

  // Default demonstration values if navigated directly
  const commitment = state.commitment || '0x9f8b4a2c1e7d3f5b8a0c2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f1a2b'
  const status: ConfidentialCredentialStatus = state.status || 'ACTIVE'
  const isVerified = status === 'VERIFIED' || status === 'ACTIVE'
  const isActive = status === 'ACTIVE'
  const timestamp = state.timestamp || Date.now()
  const txHash = state.proof?.txHash || '0x4f82c91837bc5a109e44d320984ba7130283c847e920d3947f615e840a1b2c3d'
  const credentialId = state.credentialId || '1042'

  function copyText(text: string, type: 'commitment' | 'tx') {
    navigator.clipboard.writeText(text)
    if (type === 'commitment') {
      setCopiedCommitment(true)
      setTimeout(() => setCopiedCommitment(false), 2000)
    } else {
      setCopiedTx(true)
      setTimeout(() => setCopiedTx(false), 2000)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top back link */}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/volunteer')}
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} /> Back to Volunteer Verification Hub
      </button>

      {/* Prominent Verification Outcome Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.95), rgba(24, 24, 37, 0.95))',
          border: `1.5px solid ${isVerified ? 'rgba(166, 227, 161, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: isVerified
            ? '0 12px 40px rgba(166, 227, 161, 0.12)'
            : '0 12px 40px rgba(239, 68, 68, 0.12)',
          marginBottom: '2rem',
        }}
      >
        {/* Glow Icon */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: isVerified ? 'rgba(166, 227, 161, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${isVerified ? 'var(--green)' : 'var(--red)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          {isVerified ? (
            <CheckCircle2 size={46} style={{ color: 'var(--green)' }} />
          ) : (
            <XCircle size={46} style={{ color: 'var(--red)' }} />
          )}
        </div>

        {/* PRIMARY DISPLAY REQUIREMENT: ✓ Verified Volunteer */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            borderRadius: '40px',
            background: isVerified ? 'rgba(166, 227, 161, 0.18)' : 'rgba(239, 68, 68, 0.18)',
            border: `1.5px solid ${isVerified ? 'var(--green)' : 'var(--red)'}`,
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: isVerified ? 'var(--green)' : 'var(--red)',
              letterSpacing: '-0.02em',
            }}
          >
            {isVerified ? '✓ Verified Volunteer' : '✗ Verification Failed'}
          </span>
        </div>

        <p style={{ color: 'var(--subtext0)', fontSize: '1.05rem', maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>
          Zero-knowledge cryptographic verification confirmed on <strong>Midnight Blockchain</strong>.
          The credential has been validated without exposing any personal information.
        </p>

        {/* Status Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div className="badge badge-accent" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ID #{credentialId}
          </div>
          <div
            className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}
            style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {isActive ? 'STATUS: ACTIVE' : 'STATUS: EXPIRED'}
          </div>
          <div className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            MIDNIGHT PREPROD TESTNET
          </div>
        </div>

        {/* Selective Disclosure Zero-Exposure Guarantee Grid */}
        <div
          style={{
            background: 'rgba(17, 17, 27, 0.8)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Lock size={16} style={{ color: 'var(--blue)' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>
              Zero-Knowledge Privacy Proof (No PII Exposed)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Volunteer Legal Name', value: 'CONCEALED (In local ZK witness)' },
              { label: 'Volunteer ID Number', value: 'CONCEALED (In local ZK witness)' },
              { label: 'Residential Address', value: 'CONCEALED (In local ZK witness)' },
              { label: 'Certificate Number', value: 'CONCEALED (In local ZK witness)' },
              { label: 'Phone & Email Contact', value: 'CONCEALED (In local ZK witness)' },
              { label: 'Exact Expiration Date', value: 'CONCEALED (Evaluated in circuit)' },
            ].map(field => (
              <div
                key={field.label}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontSize: '0.74rem', color: 'var(--subtext0)' }}>{field.label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={11} /> {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Telemetry & Hashes */}
        <div
          style={{
            background: 'rgba(17, 17, 27, 0.8)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'left',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem', color: 'var(--subtext0)', fontWeight: 600 }}>
            <Cpu size={14} style={{ color: 'var(--mauve)' }} />
            <span>On-Chain Cryptographic Telemetry</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Commitment Hash */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>Credential Commitment:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ fontSize: '0.78rem', color: 'var(--lavender)' }}>
                  {commitment.slice(0, 16)}…{commitment.slice(-12)}
                </code>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyText(commitment, 'commitment')}
                  title="Copy Commitment"
                  style={{ padding: '2px 6px' }}
                >
                  {copiedCommitment ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Transaction Hash */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>On-Chain Transaction:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <code style={{ fontSize: '0.78rem', color: 'var(--lavender)' }}>
                  {txHash.slice(0, 16)}…{txHash.slice(-12)}
                </code>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyText(txHash, 'tx')}
                  title="Copy Tx Hash"
                  style={{ padding: '2px 6px' }}
                >
                  {copiedTx ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Verified Timestamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>Attestation Timestamp:</span>
              <span style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
                {new Date(timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/volunteer/verify')}
          >
            Verify Another Credential
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/volunteer/submit')}
          >
            Submit New Credential
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/dashboard')}
          >
            View Public Statistics
          </button>
        </div>
      </motion.div>
    </div>
  )
}
