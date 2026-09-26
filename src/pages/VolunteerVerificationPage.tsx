// =============================================================================
// SafeCity — Module 2: Confidential Volunteer Verification Page
// Zero-Knowledge Proofs & Selective Disclosure using Midnight.js standards
// =============================================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCheck, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2,
  XCircle, Clock, AlertTriangle, Cpu, Copy, ExternalLink,
  Search, Award, Sparkles, FileText,
} from 'lucide-react'
import {
  VOLUNTEER_PRESETS,
  proveVolunteerEligibility,
  registerVolunteerCredential,
  verifyVolunteerCommitment,
  getAllAttestedVolunteers,
  submitVolunteerCredential,
  verifyVolunteerCredential,
  getVerificationStatus,
} from '@/api/volunteer'
import type {
  VolunteerCredentialInput,
  VolunteerVerificationResult,
  OnChainVolunteerAttestation,
  ConfidentialCredentialStatus,
} from '@/types'

const DEFAULT_CREDENTIAL: VolunteerCredentialInput = {
  name:              '',
  volunteerId:       '',
  address:           '',
  certificateNumber: '',
  contactInfo:       '',
  expirationDate:    new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0],
  organization:      'SafeCity Volunteer Corps',
  role:              'Community Safety Volunteer',
}

export function VolunteerVerificationPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]         = useState<'prove' | 'verifier' | 'directory'>('prove')
  const [form, setForm]                   = useState<VolunteerCredentialInput>(DEFAULT_CREDENTIAL)
  const [isProving, setIsProving]         = useState(false)
  const [proofResult, setProofResult]     = useState<VolunteerVerificationResult | null>(null)
  const [copied, setCopied]               = useState(false)

  // Public verifier search state
  const [searchCommitment, setSearchCommitment] = useState('')
  const [isSearching, setIsSearching]           = useState(false)
  const [searchResult, setSearchResult]         = useState<{
    searched: boolean
    found: boolean
    isVerified: boolean
    isActive: boolean
    attestedAt?: number
  } | null>(null)

  // Directory state
  const [directory] = useState<OnChainVolunteerAttestation[]>(() => getAllAttestedVolunteers())

  // Handle Preset selection
  function handleSelectPreset(preset: typeof VOLUNTEER_PRESETS[0]) {
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
    setProofResult(null)
  }

  // Handle Prove & Verify Credential
  async function handleProveCredential(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.volunteerId || !form.certificateNumber) return

    setIsProving(true)
    setProofResult(null)
    try {
      // First ensure credential is registered/attested on-chain, then execute prove circuit
      await registerVolunteerCredential(form)
      const res = await proveVolunteerEligibility(form)
      setProofResult(res)
    } finally {
      setIsProving(false)
    }
  }

  // Handle Public Verifier Lookup
  async function handleSearchCommitment(e: React.FormEvent) {
    e.preventDefault()
    if (!searchCommitment.trim()) return

    setIsSearching(true)
    try {
      const res = await verifyVolunteerCommitment(searchCommitment.trim())
      setSearchResult({
        searched: true,
        ...res,
      })
    } finally {
      setIsSearching(false)
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a6e3a1, #89b4fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#11111b',
              boxShadow: '0 4px 16px rgba(166, 227, 161, 0.35)',
            }}
          >
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#cdd6f4' }}>
                Confidential Volunteer Verification
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(166, 227, 161, 0.15)',
                  color: '#a6e3a1',
                  border: '1px solid rgba(166, 227, 161, 0.3)',
                  fontWeight: 600,
                }}
              >
                Midnight Selective Disclosure
              </span>
            </div>
            <p style={{ margin: 0, color: '#a6adc8', fontSize: '0.95rem' }}>
              Prove possession of a valid volunteer credential without revealing your name, ID, address, certificate number, or contact info.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Selective Disclosure Principle Banner */}
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.8), rgba(24, 24, 37, 0.8))',
          border: '1px solid rgba(166, 227, 161, 0.25)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Left: What stays hidden */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <EyeOff size={16} className="text-red" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f38ba8' }}>
                Private State (NEVER Revealed)
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Name', 'Volunteer ID', 'Home Address', 'Certificate Number', 'Contact Info'].map(f => (
                <span
                  key={f}
                  style={{
                    background: 'rgba(243, 139, 168, 0.1)',
                    border: '1px solid rgba(243, 139, 168, 0.25)',
                    color: '#f38ba8',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Lock size={10} /> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: What is selectively disclosed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Eye size={16} className="text-green" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a6e3a1' }}>
                Selectively Disclosed (Publicly Verifiable)
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  background: 'rgba(166, 227, 161, 0.15)',
                  border: '1px solid rgba(166, 227, 161, 0.35)',
                  color: '#a6e3a1',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <CheckCircle2 size={13} /> Verified / Not Verified
              </span>
              <span
                style={{
                  background: 'rgba(137, 180, 250, 0.15)',
                  border: '1px solid rgba(137, 180, 250, 0.35)',
                  color: '#89b4fa',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Clock size={13} /> Certification Active / Expired
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs & Quick Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'verifier' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('verifier')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
          >
            <Search size={16} />
            Public Verifier Portal
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'prove' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('prove')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
          >
            <Award size={16} />
            Volunteer Prover
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'directory' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('directory')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
          >
            <FileText size={16} />
            Ledger Directory
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/volunteer/submit')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <UserCheck size={14} /> Submit Credential
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/volunteer/result')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <CheckCircle2 size={14} /> Latest Result
          </button>
        </div>
      </div>

      {/* TAB 1: VOLUNTEER PROVER */}
      {activeTab === 'prove' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Credential input form */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
              border: '1px solid rgba(137, 180, 250, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            {/* Quick Demo Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#a6adc8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} className="text-yellow" />
                <span>Quick Test Credential Presets:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {VOLUNTEER_PRESETS.map(preset => (
                  <button
                    key={preset.presetLabel}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: form.volunteerId === preset.volunteerId ? 'rgba(166, 227, 161, 0.2)' : 'rgba(49, 50, 68, 0.5)',
                      border: `1px solid ${form.volunteerId === preset.volunteerId ? '#a6e3a1' : 'rgba(137, 180, 250, 0.2)'}`,
                      color: form.volunteerId === preset.volunteerId ? '#a6e3a1' : '#cdd6f4',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {preset.presetLabel}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleProveCredential}>
              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} className="text-red" /> Legal Name <span className="form-private-tag">Private Witness</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} className="text-red" /> Volunteer ID <span className="form-private-tag">Private</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. VOL-2024-8841"
                    value={form.volunteerId}
                    onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} className="text-red" /> Certificate # <span className="form-private-tag">Private</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CERT-CPR-AED-992"
                    value={form.certificateNumber}
                    onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} className="text-red" /> Residential Address <span className="form-private-tag">Private Witness</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 742 Evergreen Terrace, Sector 4"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} className="text-red" /> Contact Info <span className="form-private-tag">Private</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +1 (555) 234-8901"
                    value={form.contactInfo}
                    onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} className="text-blue" /> Expiration Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.expirationDate}
                    onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isProving || !form.name || !form.volunteerId}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}
              >
                {isProving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{ display: 'inline-flex' }}
                    >
                      <Cpu size={18} />
                    </motion.span>
                    Generating ZK Proof & Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Generate ZK Proof & Prove Credential
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Verification Certificate Result */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
              border: '1px solid rgba(137, 180, 250, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#cdd6f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} className="text-green" />
                Proof of Credential Result
              </h3>
              {proofResult && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: proofResult.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: proofResult.isActive ? '#4ade80' : '#f87171',
                    border: `1px solid ${proofResult.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                  }}
                >
                  On-Chain Verified
                </span>
              )}
            </div>

            {proofResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Two Major Disclosures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* Verified / Not Verified */}
                  <div
                    style={{
                      background: 'rgba(17, 17, 27, 0.6)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(166, 227, 161, 0.25)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#a6adc8', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Verification Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {proofResult.isVerified ? (
                        <>
                          <CheckCircle2 size={20} className="text-green" />
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a6e3a1', letterSpacing: '0.04em' }}>
                            VERIFIED
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} className="text-red" />
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em' }}>
                            NOT VERIFIED
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Certification Active / Expired */}
                  <div
                    style={{
                      background: 'rgba(17, 17, 27, 0.6)',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `1px solid ${proofResult.isActive ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#a6adc8', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Certification State
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {proofResult.isActive ? (
                        <>
                          <Clock size={20} className="text-green" />
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.04em' }}>
                            ACTIVE
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} className="text-red" />
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em' }}>
                            EXPIRED
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mathematical Zero-Knowledge Guarantee Box */}
                <div
                  style={{
                    background: 'rgba(137, 180, 250, 0.08)',
                    border: '1px solid rgba(137, 180, 250, 0.2)',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontSize: '0.82rem',
                    color: '#cdd6f4',
                    lineHeight: 1.45,
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#89b4fa', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={14} /> Zero-Knowledge Selective Disclosure Guarantee
                  </div>
                  <div>
                    This proof cryptographically establishes that the volunteer holds a certified credential from an authorized organization without disclosing their Name, Volunteer ID, Address, Certificate Number, or Contact Information.
                  </div>
                </div>

                {/* Proof Metadata */}
                <div style={{ background: 'rgba(17, 17, 27, 0.5)', borderRadius: '10px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a6adc8', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Cryptographic Proof Metadata
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: '#6c7086' }}>Circuit: </span>
                      <code style={{ color: '#cba6f7' }}>{proofResult.proof.circuitName}</code>
                    </div>
                    <div>
                      <span style={{ color: '#6c7086' }}>Proof Size: </span>
                      <code>{proofResult.proof.proofSizeBytes} bytes</code>
                    </div>
                    <div>
                      <span style={{ color: '#6c7086' }}>Generated In: </span>
                      <code>{proofResult.proof.generationTimeMs} ms</code>
                    </div>
                    <div>
                      <span style={{ color: '#6c7086' }}>Ledger Consensus: </span>
                      <span style={{ color: '#a6e3a1', fontWeight: 600 }}>Preprod Verified</span>
                    </div>
                  </div>
                </div>

                {/* Credential Commitment Hash */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a6adc8', marginBottom: '0.3rem' }}>
                    Shareable Volunteer Commitment Hash (Zero PII)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code
                      style={{
                        flex: 1,
                        background: 'rgba(17, 17, 27, 0.8)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#89b4fa',
                        fontSize: '0.76rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {proofResult.commitment}
                    </code>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => handleCopy(proofResult.commitment)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#6c7086', padding: '2rem' }}>
                <ShieldCheck size={40} style={{ marginBottom: '0.6rem', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
                  Fill in your credential details or select a preset and click "Generate ZK Proof & Prove Credential" to test.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* TAB 2: PUBLIC VERIFIER PORTAL */}
      {activeTab === 'verifier' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
            border: '1px solid rgba(137, 180, 250, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '750px',
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#cdd6f4', margin: '0 0 0.4rem 0' }}>
              Public Verifier Portal
            </h2>
            <p style={{ margin: 0, color: '#a6adc8', fontSize: '0.88rem' }}>
              Verify whether an individual holds an active certified volunteer credential without viewing any personal data.
            </p>
          </div>

          <form onSubmit={handleSearchCommitment} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Paste 32-byte Volunteer Commitment Hash (e.g. 0x7f83b1...)"
                value={searchCommitment}
                onChange={e => setSearchCommitment(e.target.value)}
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.88rem' }}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSearching || !searchCommitment.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Search size={16} />
                {isSearching ? 'Verifying…' : 'Verify'}
              </button>
            </div>
          </form>

          {/* Quick verification test buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.76rem', color: '#a6adc8', marginBottom: '0.4rem' }}>
              Or test with pre-registered commitments:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {directory.map((att, idx) => (
                <button
                  key={att.commitment}
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchCommitment(att.commitment)
                    setSearchResult({
                      searched: true,
                      found: true,
                      isVerified: att.isVerified,
                      isActive: att.isActive,
                      attestedAt: att.attestedAt,
                    })
                  }}
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  <span>{att.isActive ? '🟢 Active' : '🔴 Expired'} Commitment #{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {searchResult?.searched && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(17, 17, 27, 0.7)',
                borderRadius: '12px',
                border: `1px solid ${searchResult.found ? 'rgba(166, 227, 161, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                padding: '1.25rem',
              }}
            >
              {searchResult.found ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#a6adc8' }}>Verification Status</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a6e3a1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <CheckCircle2 size={18} /> VERIFIED
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', padding: '0.75rem', background: searchResult.isActive ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#a6adc8' }}>Certification State</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: searchResult.isActive ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        {searchResult.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        {searchResult.isActive ? 'ACTIVE' : 'EXPIRED'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#a6adc8', textAlign: 'center' }}>
                    Attested on-chain {new Date(searchResult.attestedAt || Date.now()).toLocaleDateString()}. Zero personal identity information accessible.
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#f87171' }}>
                  <AlertTriangle size={24} style={{ marginBottom: '0.3rem' }} />
                  <div style={{ fontWeight: 700 }}>Commitment Not Found</div>
                  <div style={{ fontSize: '0.82rem', color: '#a6adc8' }}>No valid credential attestation exists on-chain for this commitment hash.</div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* TAB 3: LEDGER DIRECTORY */}
      {activeTab === 'directory' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 46, 0.9), rgba(24, 24, 37, 0.9))',
            border: '1px solid rgba(137, 180, 250, 0.2)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#cdd6f4' }}>
                On-Chain Attested Volunteer Registry
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#a6adc8' }}>
                Public ledger view on Midnight testnet. Notice: Zero personally identifiable information is stored on-chain.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', background: 'rgba(166, 227, 161, 0.15)', color: '#a6e3a1', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>
              {directory.length} Attested Credentials
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {directory.map(att => (
              <div
                key={att.commitment}
                style={{
                  background: 'rgba(17, 17, 27, 0.6)',
                  border: '1px solid rgba(137, 180, 250, 0.1)',
                  borderRadius: '10px',
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={18} className={att.isActive ? 'text-green' : 'text-red'} />
                  <div>
                    <code style={{ fontSize: '0.82rem', color: '#89b4fa' }}>
                      {att.commitment.slice(0, 22)}…{att.commitment.slice(-8)}
                    </code>
                    <div style={{ fontSize: '0.72rem', color: '#6c7086' }}>
                      Attested on {new Date(att.attestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(34, 197, 94, 0.12)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}
                  >
                    Verified
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: att.isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: att.isActive ? '#4ade80' : '#f87171',
                      border: `1px solid ${att.isActive ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    }}
                  >
                    {att.isActive ? 'Certification Active' : 'Certification Expired'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
