// =============================================================================
// AgeVerificationPage.tsx — SafeCity Module 3: Age Eligibility Verification
// Proves age >= 18 using Midnight zero-knowledge proofs without revealing DOB
// Flow: Connect Lace Wallet -> Verify Age -> Display eligibility result
// =============================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  XCircle,
  Lock,
  EyeOff,
  Eye,
  Calendar,
  IdCard,
  User,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  Cpu,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { AGE_PRESETS, calculateAge } from '@/api/ageVerification'
import type { AgeCredentialInput } from '@/types'

export function AgeVerificationPage() {
  const {
    walletStatus,
    walletInfo,
    connectWallet,
    laceInstalled,
    isAgeEligible,
    ageVerification,
    isVerifyingAge,
    verifyAge,
    resetAgeVerification,
  } = useApp()

  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState<AgeCredentialInput>({
    fullName: AGE_PRESETS[0].fullName,
    dateOfBirth: AGE_PRESETS[0].dateOfBirth,
    governmentId: AGE_PRESETS[0].governmentId,
    identitySalt: AGE_PRESETS[0].identitySalt,
  })

  const [activePresetIndex, setActivePresetIndex] = useState<number>(0)
  const [calculatedLocalAge, setCalculatedLocalAge] = useState<number>(() =>
    calculateAge(AGE_PRESETS[0].dateOfBirth)
  )

  useEffect(() => {
    setCalculatedLocalAge(calculateAge(formData.dateOfBirth))
  }, [formData.dateOfBirth])

  const handleApplyPreset = (index: number) => {
    setActivePresetIndex(index)
    const preset = AGE_PRESETS[index]
    setFormData({
      fullName: preset.fullName,
      dateOfBirth: preset.dateOfBirth,
      governmentId: preset.governmentId,
      identitySalt: preset.identitySalt,
    })
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (walletStatus !== 'connected') {
      await connectWallet()
      return
    }
    await verifyAge(formData)
  }

  return (
    <div className="page-container age-verification-page">
      {/* Header Banner */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="page-badge">
          <ShieldAlert size={14} className="text-accent" />
          <span>Module 3: Zero-Knowledge Age Verification</span>
        </div>
        <h1 className="page-title">Age Eligibility Verification</h1>
        <p className="page-subtitle">
          Prove you are at least <strong>18 years old</strong> before accessing public safety reporting features.
          Midnight zero-knowledge proofs mathematically guarantee that your <strong>actual age</strong>,{' '}
          <strong>date of birth</strong>, and <strong>government ID</strong> are never exposed on-chain.
        </p>
      </motion.div>

      {/* Verification Flow Progress Steps */}
      <div className="flow-steps-grid">
        <div className={`flow-step-card ${walletStatus === 'connected' ? 'active' : ''}`}>
          <div className="flow-step-number">1</div>
          <div className="flow-step-info">
            <h4>Connect Lace Wallet</h4>
            <p>{walletStatus === 'connected' ? 'Connected & Ready' : 'Authentication Required'}</p>
          </div>
        </div>

        <div className={`flow-step-card ${formData.dateOfBirth ? 'active' : ''}`}>
          <div className="flow-step-number">2</div>
          <div className="flow-step-info">
            <h4>Private Witness Input</h4>
            <p>Formed in browser RAM only</p>
          </div>
        </div>

        <div className={`flow-step-card ${ageVerification ? 'completed' : isVerifyingAge ? 'active' : ''}`}>
          <div className="flow-step-number">3</div>
          <div className="flow-step-info">
            <h4>Execute ZK Circuit</h4>
            <p>Evaluating age &gt;= 18 in ZK</p>
          </div>
        </div>

        <div className={`flow-step-card ${ageVerification?.isEligible ? 'success' : ageVerification ? 'rejected' : ''}`}>
          <div className="flow-step-number">4</div>
          <div className="flow-step-info">
            <h4>Eligibility Result</h4>
            <p>
              {ageVerification?.status === 'ELIGIBLE'
                ? '✓ Verified (18+)'
                : ageVerification?.status === 'NOT ELIGIBLE'
                ? '✗ Not Eligible (<18)'
                : 'Awaiting Proof'}
            </p>
          </div>
        </div>
      </div>

      <div className="age-verify-layout">
        {/* Left Column: Form & Presets */}
        <motion.div
          className="card form-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="card-header">
            <div className="card-icon-title">
              <div className="icon-wrapper">
                <IdCard size={20} />
              </div>
              <div>
                <h2 className="card-title">Age Credential Witness</h2>
                <p className="card-subtitle">Values remain strictly on your local device</p>
              </div>
            </div>
            <span className="privacy-pill">
              <Lock size={12} /> Confidential
            </span>
          </div>

          {/* Persona Presets */}
          <div className="presets-container">
            <label className="input-label">Quick Test Presets:</label>
            <div className="preset-buttons-row">
              {AGE_PRESETS.map((p, idx) => (
                <button
                  key={p.presetLabel}
                  type="button"
                  className={`btn-preset ${activePresetIndex === idx ? 'btn-preset--active' : ''}`}
                  onClick={() => handleApplyPreset(idx)}
                >
                  <span className="preset-name">{p.presetLabel}</span>
                  <span className={`preset-badge ${p.expectedStatus === 'ELIGIBLE' ? 'badge-green' : 'badge-red'}`}>
                    Age {p.ageHint} ({p.expectedStatus})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleVerify} className="credential-form">
            <div className="form-group">
              <label htmlFor="fullName" className="input-label">
                <User size={14} /> Full Legal Name (Private Witness)
              </label>
              <input
                id="fullName"
                type="text"
                className="input-field"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="e.g. John Doe"
                required
              />
              <span className="field-hint">Never written to the public ledger.</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="input-label">
                  <Calendar size={14} /> Date of Birth (Private Witness)
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="input-field"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  required
                />
                <span className="field-hint">
                  Client-side calculated: <strong>{calculatedLocalAge} years old</strong>
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="governmentId" className="input-label">
                  <IdCard size={14} /> Government ID / Driver's License
                </label>
                <input
                  id="governmentId"
                  type="text"
                  className="input-field"
                  value={formData.governmentId}
                  onChange={e => setFormData(prev => ({ ...prev, governmentId: e.target.value }))}
                  placeholder="e.g. DL-WA-9824-771"
                  required
                />
                <span className="field-hint">Hashed locally into witness seed.</span>
              </div>
            </div>

            {/* Wallet State Reminder */}
            {walletStatus !== 'connected' && (
              <div className="wallet-warning-banner">
                <Wallet size={16} />
                <span>Lace Wallet must be connected to submit verification proofs.</span>
                <button
                  type="button"
                  className="btn btn-sm btn-primary ml-auto"
                  onClick={laceInstalled ? connectWallet : () => navigate('/connect')}
                >
                  {laceInstalled ? 'Connect Lace' : 'Get Lace'}
                </button>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={isVerifyingAge || !formData.dateOfBirth}
                className="btn btn-primary btn-block"
              >
                {isVerifyingAge ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Executing submitAgeCredential() Circuit…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Prove Age &ge; 18 via Zero-Knowledge Circuit</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Result & Selective Disclosure Matrix */}
        <div className="results-column">
          <AnimatePresence mode="wait">
            {ageVerification ? (
              <motion.div
                key="result-card"
                className={`card result-card ${ageVerification.isEligible ? 'result-card--eligible' : 'result-card--not-eligible'}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="result-header">
                  {ageVerification.isEligible ? (
                    <div className="result-badge-large eligible">
                      <CheckCircle2 size={36} />
                      <div>
                        <h3>ELIGIBLE (Age 18+)</h3>
                        <p>Zero-Knowledge Proof Verified On-Chain</p>
                      </div>
                    </div>
                  ) : (
                    <div className="result-badge-large not-eligible">
                      <XCircle size={36} />
                      <div>
                        <h3>NOT ELIGIBLE (Under 18)</h3>
                        <p>Public Safety Reporting Requires Age &ge; 18</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={resetAgeVerification}
                    className="btn btn-ghost btn-sm"
                    title="Reset verification"
                  >
                    <RefreshCw size={14} /> Clear
                  </button>
                </div>

                <div className="result-details">
                  <div className="detail-item">
                    <span className="detail-label">Protocol Status Code</span>
                    <span className="detail-value mono">
                      {ageVerification.statusCode} ({ageVerification.status})
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Credential ID</span>
                    <span className="detail-value mono">#{ageVerification.credentialId.toString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Proof Size / Latency</span>
                    <span className="detail-value mono">
                      {ageVerification.proof.proofSizeBytes} Bytes / {ageVerification.proof.generationTimeMs}ms
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transaction Hash</span>
                    <span className="detail-value mono truncate">
                      {ageVerification.proof.txHash || '0xSimulatedProofPreprod...'}
                    </span>
                  </div>
                </div>

                {/* Direct Action Launchpads */}
                {ageVerification.isEligible && (
                  <div className="navigation-launchpads">
                    <p className="launchpad-title">
                      <Sparkles size={14} className="text-green" /> You now have full clearance to report incidents:
                    </p>
                    <div className="launchpad-buttons">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/submit')}
                      >
                        <span>Submit Anonymous Crime Report</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate('/volunteer')}
                      >
                        <span>Volunteer Verification</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="awaiting-card"
                className="card awaiting-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="awaiting-icon">
                  <Clock size={40} className="text-subtle" />
                </div>
                <h3>Awaiting Age Verification Proof</h3>
                <p>
                  Fill in the witness form or select a test preset on the left, then click{' '}
                  <strong>Prove Age &ge; 18</strong> to execute the Midnight circuit.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy & Selective Disclosure Matrix Card */}
          <div className="card privacy-summary-card">
            <h3 className="matrix-title">
              <Lock size={16} className="text-accent" /> Privacy & Selective Disclosure Matrix
            </h3>

            <div className="matrix-grid">
              <div className="matrix-box disclosed">
                <div className="matrix-box-header">
                  <Eye size={16} className="text-green" />
                  <h4>Revealed to Public Observers</h4>
                </div>
                <ul>
                  <li>✅ Verification Outcome: <code>ELIGIBLE</code> or <code>NOT ELIGIBLE</code></li>
                  <li>✅ Timestamp of verification proof</li>
                  <li>✅ Aggregate verification counters</li>
                </ul>
              </div>

              <div className="matrix-box hidden">
                <div className="matrix-box-header">
                  <EyeOff size={16} className="text-red" />
                  <h4>Strictly Concealed by ZK Proof</h4>
                </div>
                <ul>
                  <li>❌ Actual age in years (e.g. 26)</li>
                  <li>❌ Exact date of birth</li>
                  <li>❌ National ID / Driver's license number</li>
                  <li>❌ Legal name & personal information</li>
                </ul>
              </div>
            </div>

            <div className="circuit-math-explainer">
              <Info size={14} />
              <span>
                <strong>Circuit Logic:</strong> Proves the statement <code>age &ge; 18</code> within an arithmetic circuit.
                The verifier learns only whether the constraint is satisfied without revealing the value of <code>age</code>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
