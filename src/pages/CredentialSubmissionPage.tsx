// =============================================================================
// SafeCity — Credential Submission Page
// Confidential Volunteer Credential Submission via Midnight ZK Witnesses
// =============================================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, Lock, ShieldCheck, Sparkles, ArrowRight,
  Loader2, AlertCircle, CheckCircle, Info, Calendar, Award, Phone, MapPin, Hash, User
} from 'lucide-react'
import { VOLUNTEER_PRESETS, submitVolunteerCredential } from '@/api/volunteer'
import type { VolunteerCredentialInput, ProofMetadata, ConfidentialCredentialStatus } from '@/types'

const DEFAULT_FORM: VolunteerCredentialInput = {
  name:              '',
  volunteerId:       '',
  address:           '',
  certificateNumber: '',
  contactInfo:       '',
  expirationDate:    new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
  organization:      'SafeCity Emergency Medical Corps',
  role:              'Certified First Responder',
}

export function CredentialSubmissionPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<VolunteerCredentialInput>(DEFAULT_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handlePresetSelect(preset: typeof VOLUNTEER_PRESETS[0]) {
    setForm({
      name:              preset.name,
      volunteerId:       preset.volunteerId,
      address:           preset.address,
      certificateNumber: preset.certificateNumber,
      contactInfo:       preset.contactInfo,
      expirationDate:    preset.expirationDate,
      organization:      preset.organization,
      role:              preset.role,
    })
    setErrorMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    // Form validation
    if (!form.name.trim()) {
      setErrorMessage('Please enter the volunteer legal name (kept private in local witness).')
      return
    }
    if (!form.volunteerId.trim()) {
      setErrorMessage('Please enter the volunteer ID number.')
      return
    }
    if (!form.certificateNumber.trim()) {
      setErrorMessage('Please enter the official certificate or accreditation number.')
      return
    }
    if (!form.address.trim()) {
      setErrorMessage('Please enter the residential physical address.')
      return
    }
    if (!form.contactInfo.trim()) {
      setErrorMessage('Please enter a contact phone number.')
      return
    }
    if (!form.expirationDate) {
      setErrorMessage('Please select a valid certificate expiration date.')
      return
    }

    setIsSubmitting(true)
    try {
      setSubmitStep('1/3: Binding 7 private fields into local ZK witness memory…')
      await new Promise(r => setTimeout(r, 600))

      setSubmitStep('2/3: Executing submitVolunteerCredential() circuit & generating zk-SNARK proof…')
      const result = await submitVolunteerCredential(form)

      setSubmitStep('3/3: Recording public verification status on Midnight Preprod ledger…')
      await new Promise(r => setTimeout(r, 600))

      // Navigate to dedicated Verification Result page with state
      navigate('/volunteer/result', {
        state: {
          credentialId: result.credentialId.toString(),
          commitment: result.commitment,
          status: result.status,
          statusCode: result.statusCode,
          proof: result.proof,
          organization: form.organization,
          role: form.role,
          timestamp: Date.now(),
        },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during credential submission.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
      setSubmitStep('')
    }
  }

  return (
    <div className="page" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(166, 227, 161, 0.1)', border: '1px solid rgba(166, 227, 161, 0.3)', marginBottom: '0.8rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--green)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--green)' }}>
            Confidential Credential Verification Module
          </span>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>
          Credential Submission
        </h1>
        <p style={{ color: 'var(--subtext0)', fontSize: '0.98rem', maxWidth: '650px', margin: '0 auto' }}>
          Submit your emergency response or community safety credential. Private state witnesses ensure your personal information is
          <strong> mathematically impossible to expose</strong>.
        </p>
      </motion.div>

      {/* Preset Pickers */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--subtext0)', marginBottom: '0.75rem' }}>
          <Sparkles size={14} style={{ color: 'var(--yellow)' }} />
          <span>Quick Demo Presets (Instant Populate):</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {VOLUNTEER_PRESETS.map(preset => (
            <button
              key={preset.presetLabel}
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => handlePresetSelect(preset)}
              style={{
                fontSize: '0.78rem',
                borderColor: form.volunteerId === preset.volunteerId ? 'var(--green)' : 'var(--border)',
                background: form.volunteerId === preset.volunteerId ? 'rgba(166, 227, 161, 0.12)' : 'transparent',
                color: form.volunteerId === preset.volunteerId ? 'var(--green)' : 'var(--text)',
              }}
            >
              {preset.presetLabel} ({preset.expectedStatus})
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
        }}
      >
        {/* Error Notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--red)',
                fontSize: '0.88rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Legal Name */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} style={{ color: 'var(--blue)' }} /> Legal Full Name
                </span>
                <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> Private Witness
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Volunteer ID */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Hash size={13} style={{ color: 'var(--blue)' }} /> Volunteer / Badge ID
                </span>
                <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> Private Witness
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. VOL-EMERG-2024-8841"
                value={form.volunteerId}
                onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Certificate Number */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Award size={13} style={{ color: 'var(--blue)' }} /> Official Certificate Number
                </span>
                <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> Private Witness
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CERT-CPR-AED-992014"
                value={form.certificateNumber}
                onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={13} style={{ color: 'var(--blue)' }} /> Contact Phone / Number
                </span>
                <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> Private Witness
                </span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 234-8901"
                value={form.contactInfo}
                onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Expiration Date */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} style={{ color: 'var(--blue)' }} /> Expiration Date
                </span>
                <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> Private Witness
                </span>
              </label>
              <input
                type="date"
                className="form-input"
                value={form.expirationDate}
                onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Role Title */}
            <div className="form-group">
              <label className="form-label">
                Volunteer Role / Designation
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Certified Emergency Medic"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Residential Address */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={13} style={{ color: 'var(--blue)' }} /> Residential Physical Address
              </span>
              <span className="badge badge-private" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Lock size={10} /> Private Witness
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 742 Evergreen Terrace, Sector 4, Metro City"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Privacy Notice Box */}
          <div
            style={{
              background: 'rgba(137, 180, 250, 0.06)',
              border: '1px solid rgba(137, 180, 250, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '2rem',
              fontSize: '0.85rem',
              color: 'var(--subtext0)',
              lineHeight: 1.5,
              display: 'flex',
              gap: '12px',
            }}
          >
            <Info size={18} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text)' }}>Zero-Knowledge Privacy Guarantee:</strong>
              <br />
              All entered details (Legal Name, Volunteer ID, Residential Address, Certificate Number, Phone, and Expiration Date) remain
              strictly in your browser's private memory witness. The Midnight Compact circuit calculates the cryptographic commitment and verifies validity
              without publishing a single personal attribute.
            </div>
          </div>

          {/* Submit Actions & Loading Progress */}
          <div>
            {isSubmitting ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(17, 17, 27, 0.6)', borderRadius: 'var(--radius-lg)' }}>
                <Loader2 size={32} className="spin" style={{ color: 'var(--green)', margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.4rem' }}>
                  Generating Midnight ZK Proof…
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--subtext0)', fontFamily: 'monospace' }}>
                  {submitStep}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setForm(DEFAULT_FORM)}
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserCheck size={18} />
                  Submit Credential to Ledger
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
