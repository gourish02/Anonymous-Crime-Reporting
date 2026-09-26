// =============================================================================
// SubmitReportPage — crime report submission form with all required fields
// =============================================================================

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MapPin, Calendar, AlignLeft, Link2,
  Send, Cpu, ShieldCheck, AlertTriangle, Lock, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '@/context/AppContext'
import { PrivacyBadge } from '@/components/PrivacyBadge'
import { AICrimeAssistant } from '@/components/AICrimeAssistant'
import type { ReportFormData, CrimeTypeKey } from '@/types'
import { CRIME_TYPES, CRIME_TYPE_ICONS } from '@/types'

const INITIAL_FORM: ReportFormData = {
  crimeType:    1,
  location:     '',
  date:         new Date().toISOString().split('T')[0],
  description:  '',
  evidenceHash: '',
}

export function SubmitReportPage() {
  const { isConnected, isSubmitting, lastSubmission, submitReport, connectWallet, isAgeEligible } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const locState = location.state as { initialDescription?: string; initialCrimeType?: number } | undefined

  const [form, setForm]           = useState<ReportFormData>(() => ({
    ...INITIAL_FORM,
    description: locState?.initialDescription || '',
    crimeType: (locState?.initialCrimeType || 1) as CrimeTypeKey,
  }))
  const [errors, setErrors]       = useState<Partial<Record<keyof ReportFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.location.trim())    e.location    = 'Location is required'
    if (!form.date)               e.date        = 'Date is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (form.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Age Verification Gate: User must prove age >= 18
    if (!isAgeEligible) {
      toast.error('Age Verification Required: Midnight protocol requires proving you are at least 18 years old before submitting reports.', {
        icon: '🔒',
        duration: 5000,
      })
      navigate('/age-verify')
      return
    }

    const result = await submitReport(form)
    if (result) {
      setSubmitted(true)
      setForm(INITIAL_FORM)
    }
  }

  // ── Not connected guard ────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="page page-guard">
        <motion.div
          className="guard-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertTriangle size={40} className="text-amber" />
          <h2>Wallet Not Connected</h2>
          <p>Connect your Lace Wallet before submitting a report.</p>
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

  // ── Success view ───────────────────────────────────────────────────────────
  if (submitted && lastSubmission) {
    return (
      <div className="page page-center">
        <motion.div
          className="success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180 }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <ShieldCheck size={48} />
          </motion.div>
          <h2>Report Submitted Anonymously!</h2>
          <div className="success-meta">
            <div className="success-field">
              <label>Report ID</label>
              <code>#{lastSubmission.reportId.toString()}</code>
            </div>
            <div className="success-field">
              <label>ZK Proof Size</label>
              <code>{lastSubmission.proof.proofSizeBytes} bytes</code>
            </div>
            <div className="success-field">
              <label>Proof Generated In</label>
              <code>{lastSubmission.proof.generationTimeMs} ms</code>
            </div>
            <div className="success-field">
              <label>TX Hash</label>
              <code className="text-truncate">{lastSubmission.txHash.slice(0, 24)}…</code>
            </div>
          </div>

          <PrivacyBadge
            variant="claim"
            claim="Report submitted — your identity was never revealed"
          />

          <div className="success-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/verify?id=${lastSubmission.reportId}`)}
            >
              <ShieldCheck size={16} /> Verify This Report
            </button>
            <button
              className="btn btn-outline"
              onClick={() => { setSubmitted(false) }}
            >
              Submit Another
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/history')}>
              View All Reports
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="page submit-page">
      <div className="submit-layout">
        {/* Left: form */}
        <motion.div
          className="submit-form-wrap"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="page-header">
            <FileText size={24} className="text-lavender" />
            <div>
              <h1>Submit Report</h1>
              <p>Your identity is protected by zero-knowledge proof.</p>
            </div>
          </div>

          <PrivacyBadge variant="banner" />

          {/* Age Eligibility Status Gate */}
          {isAgeEligible ? (
            <div className="age-gate-banner verified" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', marginBottom: '1rem', color: '#22c55e', fontSize: '0.875rem' }}>
              <CheckCircle2 size={18} />
              <span><strong>Age Verified (18+):</strong> Cleared by Midnight zero-knowledge proof. Identity and birth date remain confidential.</span>
            </div>
          ) : (
            <div className="age-gate-banner warning" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '8px', marginBottom: '1rem', color: '#f59e0b', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span><strong>Age Verification Required:</strong> Must prove age &ge; 18 before filing public safety reports.</span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => navigate('/age-verify')}
              >
                Verify Age (ZK) &rarr;
              </button>
            </div>
          )}

          <form className="report-form" onSubmit={handleSubmit} noValidate>

            {/* AI Crime Classifier Assistant */}
            <AICrimeAssistant
              description={form.description}
              currentCategory={form.crimeType}
              onSelectCategory={(catId) => setForm(f => ({ ...f, crimeType: catId }))}
              onSetDescription={(text) => setForm(f => ({ ...f, description: text }))}
            />

            {/* Crime Type */}
            <fieldset className="form-group">
              <legend className="form-label">Crime Type *</legend>
              <div className="crime-type-grid">
                {(Object.entries(CRIME_TYPES) as [string, string][]).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    className={`crime-type-btn ${form.crimeType === Number(k) ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, crimeType: Number(k) as CrimeTypeKey }))}
                  >
                    <span>{CRIME_TYPE_ICONS[Number(k)]}</span>
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">
                <MapPin size={14} />
                Location * <span className="form-private-tag"><Lock size={10} /> Private</span>
              </label>
              <input
                id="location"
                className={`form-input ${errors.location ? 'form-input--error' : ''}`}
                type="text"
                placeholder="Street address, landmark, or area (stays private)"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                disabled={isSubmitting}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
              <span className="form-hint">
                📍 Location is hashed locally — never posted on-chain
              </span>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="date">
                <Calendar size={14} />
                Date of Incident *
              </label>
              <input
                id="date"
                className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                disabled={isSubmitting}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                <AlignLeft size={14} />
                Description * <span className="form-private-tag"><Lock size={10} /> Private</span>
              </label>
              <textarea
                id="description"
                className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
                placeholder="Describe what happened in detail (minimum 20 characters). This stays private."
                rows={5}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                disabled={isSubmitting}
              />
              <div className="form-char-count">
                {form.description.length} chars
                {form.description.length < 20 && form.description.length > 0 &&
                  <span className="text-amber"> (min 20)</span>
                }
              </div>
              {errors.description && <span className="form-error">{errors.description}</span>}
              <span className="form-hint">
                📝 Description is hashed locally — never posted on-chain
              </span>
            </div>

            {/* Evidence Hash */}
            <div className="form-group">
              <label className="form-label" htmlFor="evidence">
                <Link2 size={14} />
                Evidence Hash <span className="form-optional">(optional)</span>
              </label>
              <input
                id="evidence"
                className="form-input"
                type="text"
                placeholder="IPFS CID or SHA-256 hash of evidence file"
                value={form.evidenceHash}
                onChange={e => setForm(f => ({ ...f, evidenceHash: e.target.value }))}
                disabled={isSubmitting}
              />
              <span className="form-hint">
                📎 If you have photos/documents, upload to IPFS and paste the CID here
              </span>
            </div>

            {/* Submit */}
            <AnimatePresence mode="wait">
              <motion.button
                key={isSubmitting ? 'submitting' : 'idle'}
                type="submit"
                className="btn btn-primary btn-submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ display: 'inline-flex' }}
                    >
                      <Cpu size={18} />
                    </motion.span>
                    Generating ZK Proof & Submitting…
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Anonymously
                  </>
                )}
              </motion.button>
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Right: privacy panel */}
        <motion.aside
          className="submit-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="sidebar-card">
            <h3><ShieldCheck size={16} /> Privacy Guarantee</h3>
            <div className="privacy-rows">
              {[
                { field: 'Your Wallet Address', status: 'private' },
                { field: 'Location',            status: 'private' },
                { field: 'Description',         status: 'private' },
                { field: 'Crime Type',          status: 'public'  },
                { field: 'Report ID',           status: 'public'  },
                { field: 'Timestamp',           status: 'public'  },
              ].map(r => (
                <div key={r.field} className={`privacy-row privacy-row--${r.status}`}>
                  <span className="privacy-row-label">{r.field}</span>
                  <span className={`privacy-badge privacy-badge--${r.status}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card sidebar-card--dark">
            <h3><Cpu size={16} /> ZK Proof Process</h3>
            <ol className="proof-steps">
              <li>Form data hashed locally in browser</li>
              <li>Witnesses constructed (never leave device)</li>
              <li>ZK proof generated (1–3 seconds)</li>
              <li>Only proof + public inputs sent to chain</li>
              <li>Node verifies proof without seeing your data</li>
            </ol>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
