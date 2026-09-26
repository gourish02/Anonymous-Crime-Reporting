// =============================================================================
// VerificationPage — verify a report and display the privacy claim result
// =============================================================================

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Search, Loader2, CheckCircle,
  XCircle, AlertTriangle, Lock, Cpu, ArrowRight,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PrivacyBadge } from '@/components/PrivacyBadge'
import { REPORT_STATUS, STATUS_COLORS, type StatusKey } from '@/types'

export function VerificationPage() {
  const { isConnected, isVerifying, lastVerification, verifyReport, checkStatus, connectWallet } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [reportId, setReportId]   = useState(searchParams.get('id') ?? '')
  const [idError,  setIdError]    = useState('')
  const [result,   setResult]     = useState(lastVerification)

  // Pre-fill from query param
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) setReportId(id)
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = reportId.trim()
    if (!id || isNaN(Number(id))) {
      setIdError('Enter a valid numeric Report ID')
      return
    }
    setIdError('')
    const res = await verifyReport(BigInt(id))
    if (res) setResult(res)
  }

  const handleCheckStatus = async () => {
    const id = reportId.trim()
    if (!id || isNaN(Number(id))) { setIdError('Enter a valid Report ID'); return }
    await checkStatus(BigInt(id))
  }

  if (!isConnected) {
    return (
      <div className="page page-guard">
        <motion.div className="guard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={40} className="text-amber" />
          <h2>Wallet Not Connected</h2>
          <p>Connect your Lace Wallet to verify reports.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={connectWallet}>
              <ShieldCheck size={16} /> Connect Wallet
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/connect')}>
              Wallet Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page verify-page">
      <div className="verify-layout">

        {/* ── Input panel ──────────────────────────────────────────── */}
        <motion.div
          className="verify-input-panel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="page-header">
            <ShieldCheck size={24} className="text-green" />
            <div>
              <h1>Verify Report</h1>
              <p>Confirm a report is legitimate — without learning who submitted it.</p>
            </div>
          </div>

          <form className="verify-form" onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label" htmlFor="report-id">
                <Search size={14} /> Report ID
              </label>
              <div className="verify-input-row">
                <input
                  id="report-id"
                  className={`form-input ${idError ? 'form-input--error' : ''}`}
                  type="text"
                  placeholder="e.g. 123456"
                  value={reportId}
                  onChange={e => { setReportId(e.target.value); setIdError('') }}
                  disabled={isVerifying}
                />
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isVerifying}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isVerifying
                    ? <><Loader2 size={16} className="spin" /> Verifying…</>
                    : <><ShieldCheck size={16} /> Verify</>}
                </motion.button>
              </div>
              {idError && <span className="form-error">{idError}</span>}
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleCheckStatus}
              disabled={isVerifying}
            >
              Check Status Only (read-only)
            </button>
          </form>

          {/* ZK flow explanation */}
          <div className="verify-explainer">
            <h3><Lock size={14} /> How Verification Works</h3>
            <div className="verify-flow">
              {[
                { step: '1', label: 'ZK Proof Generated',     sub: 'Locally in your browser'         },
                { step: '2', label: 'Proof Sent to Chain',     sub: 'No identity data included'       },
                { step: '3', label: 'Node Verifies Proof',     sub: 'Confirms validity without seeing reporter' },
                { step: '4', label: 'Status Updated On-Chain', sub: 'Public: "Verified" status only'  },
              ].map(s => (
                <div key={s.step} className="verify-flow-step">
                  <div className="flow-step-num">{s.step}</div>
                  <div>
                    <strong>{s.label}</strong>
                    <span>{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Result panel ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isVerifying ? (
            <motion.div
              key="verifying"
              className="verify-result-panel verify-result-panel--loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <Cpu size={44} className="text-lavender" />
              </motion.div>
              <h3>Generating Verification Proof…</h3>
              <p>This takes 1–3 seconds. The proof ensures the report is valid without revealing the reporter.</p>
              <div className="proof-progress-bar">
                <motion.div
                  className="proof-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              className={`verify-result-panel verify-result-panel--${result.verified ? 'verified' : 'failed'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Result icon */}
              <motion.div
                className="result-icon"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {result.verified
                  ? <CheckCircle size={56} className="text-green" />
                  : <XCircle    size={56} className="text-red"   />}
              </motion.div>

              <h2 className={result.verified ? 'text-green' : 'text-red'}>
                {result.verified ? 'Report Verified!' : 'Verification Failed'}
              </h2>

              {/* Privacy claim — the key observable behavior */}
              <PrivacyBadge
                variant="claim"
                claim={result.privacyClaim}
              />

              {/* Proof metadata */}
              <div className="result-meta-grid">
                <div className="result-meta-item">
                  <label>Report ID</label>
                  <code>#{result.reportId.toString()}</code>
                </div>
                <div className="result-meta-item">
                  <label>Status</label>
                  {(() => {
                    const sk = (result.status in REPORT_STATUS ? result.status : 0) as StatusKey
                    const color = STATUS_COLORS[sk]
                    return (
                      <span
                        className="status-pill"
                        style={{
                          color,
                          borderColor: `${color}40`,
                          background: `${color}10`,
                        }}
                      >
                        {REPORT_STATUS[sk]}
                      </span>
                    )
                  })()}
                </div>
                <div className="result-meta-item">
                  <label>Proof Size</label>
                  <code>{result.proof.proofSizeBytes} bytes</code>
                </div>
                <div className="result-meta-item">
                  <label>Generation Time</label>
                  <code>{result.proof.generationTimeMs} ms</code>
                </div>
                <div className="result-meta-item">
                  <label>Circuit</label>
                  <code>{result.proof.circuitName}</code>
                </div>
                <div className="result-meta-item">
                  <label>On-Chain Verified</label>
                  <code>{result.proof.verifiedOnChain ? '✅ Yes' : '❌ No'}</code>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate('/history')}
                >
                  <ArrowRight size={16} /> View All Reports
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setResult(null)}
                >
                  Verify Another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="verify-result-panel verify-result-panel--empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShieldCheck size={52} className="text-overlay" />
              <h3>Enter a Report ID</h3>
              <p>Enter the Report ID you received after submitting, then click Verify.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
