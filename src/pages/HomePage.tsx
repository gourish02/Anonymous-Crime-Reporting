// =============================================================================
// SafeCity HomePage — Multi-Module Public Safety & Privacy Platform
// Module 1: Anonymous Crime Reporting & AI Classifier
// Module 2: Confidential Volunteer Verification (Selective Disclosure)
// =============================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, FileText, CheckCircle, History,
  Lock, Eye, Zap, ArrowRight, Users, Sparkles, UserCheck, ShieldAlert, BadgeCheck, BarChart3,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getAllAttestedVolunteers } from '@/api/volunteer'

const PLATFORM_MODULES = [
  {
    id: 'crime-reporting',
    badge: 'Module 01',
    title: 'Anonymous Crime Reporting',
    tagline: 'Zero-Knowledge Whistleblowing & Corroboration',
    desc: 'Submit incident reports with cryptographic anonymity. Identities never touch the ledger; only tamper-proof proofs and verified statuses are public.',
    icon: <FileText size={28} />,
    color: 'var(--blue)',
    links: [
      { label: 'Crime Portal', to: '/crime', primary: true },
      { label: 'Submit Report', to: '/submit', primary: false },
      { label: 'AI Classifier', to: '/classifier', primary: false },
    ],
    features: [
      'Lace Wallet ZK transaction signing',
      'FastAPI + Scikit-Learn threat analyzer',
      'Anonymous community upvoting & corroboration',
    ],
  },
  {
    id: 'volunteer-verification',
    badge: 'Module 02 · NEW',
    title: 'Confidential Volunteer Verification',
    tagline: 'Selective Disclosure & Zero-Knowledge Credentials',
    desc: 'Volunteers prove authentic credentials without revealing Name, Volunteer ID, Address, Certificate Number, or Phone/Email. Discloses ONLY Verified & Active status.',
    icon: <UserCheck size={28} />,
    color: 'var(--green)',
    links: [
      { label: 'Submit Credential', to: '/volunteer/submit', primary: true },
      { label: 'Verify Volunteer', to: '/volunteer/verify', primary: false },
      { label: 'Public Statistics', to: '/dashboard', primary: false },
    ],
    features: [
      'Hides 5 sensitive PII attributes completely',
      'ZK evaluates expiration date vs current timestamp',
      'Reveals only: Verified/Not Verified & Active/Expired',
    ],
  },
]

const SELECTIVE_DISCLOSURE_MATRIX = [
  {
    category: 'Citizen Crime Reporting',
    hidden: ['Reporter Wallet Identity', 'Reporter Real Name / IP', 'Full Narrative & Evidence Text'],
    revealed: ['Report ID Hash', 'Verification State (true/false)', 'Timestamp & Upvote Count'],
  },
  {
    category: 'Volunteer Credentialing',
    hidden: ['Volunteer Full Legal Name', 'Volunteer ID Number', 'Residential Address', 'Certificate Number', 'Phone & Email Contact'],
    revealed: ['Verified / Not Verified Status', 'Certification Active / Expired State', 'On-Chain Commitment Hash'],
  },
]

const CORE_PILLARS = [
  {
    icon: <Sparkles size={24} />,
    title: 'AI Threat Classifier',
    desc: 'Scikit-learn TF-IDF + Logistic Regression pipeline classifies descriptions into 5 categories, assessing risk and confidence scores in real time.',
    color: 'var(--mauve)',
  },
  {
    icon: <Lock size={24} />,
    title: 'Zero-Knowledge Privacy',
    desc: 'Compact smart contracts on Midnight Protocol ensure private state stays in local witnesses. Mathematical validity without surveillance.',
    color: 'var(--blue)',
  },
  {
    icon: <Eye size={24} />,
    title: 'Selective Disclosure',
    desc: 'Cryptographically disclose only the required verification conclusions while concealing underlying sensitive identifying credentials.',
    color: 'var(--green)',
  },
  {
    icon: <Zap size={24} />,
    title: 'Midnight Preprod Blockchain',
    desc: 'Engineered for Cardano-aligned Midnight zk-SNARK execution with Lace Wallet connectivity and deterministic Compact circuits.',
    color: 'var(--yellow)',
  },
  {
    icon: <Users size={24} />,
    title: 'Decentralized Civic Trust',
    desc: 'Empower communities, NGOs, and municipal authorities to collaborate safely during emergencies and safety audits.',
    color: 'var(--teal)',
  },
  {
    icon: <ShieldAlert size={24} />,
    title: 'Tamper-Proof Audit Trail',
    desc: 'All verification proofs are indelibly recorded on-chain, eliminating forged credentials and fabricated emergency claims.',
    color: 'var(--red)',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { isConnected, reports } = useApp()
  const [volunteers, setVolunteers] = useState(() => getAllAttestedVolunteers())

  useEffect(() => {
    setVolunteers(getAllAttestedVolunteers())
  }, [])

  const totalReports = reports.length
  const verifiedReports = reports.filter(r => r.verified).length
  const totalVolunteers = volunteers.length
  const activeVolunteers = volunteers.filter(v => v.isActive).length

  return (
    <div className="page home-page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-eyebrow">
            <ShieldCheck size={14} /> SafeCity Protocol · Midnight Blockchain Multi-Module Platform
          </div>

          <h1 className="hero-heading">
            SafeCity
            <br />
            <span className="gradient-text">Confidential Public Safety Platform</span>
          </h1>

          <p className="hero-sub">
            Decentralized public safety combining <strong>Zero-Knowledge Anonymous Crime Reporting</strong> with{' '}
            <strong>Confidential Volunteer Verification</strong>. Proving authenticity and legitimacy without
            surrendering citizen privacy.
          </p>

          <div className="hero-actions">
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(isConnected ? '/submit' : '/connect')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={18} />
              {isConnected ? 'Submit Crime Report' : 'Connect Lace Wallet'}
              <ArrowRight size={16} />
            </motion.button>

            <motion.button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/volunteer')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <UserCheck size={18} />
              Volunteer Verification
            </motion.button>

            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 size={18} /> Public Statistics
            </button>
          </div>

          {/* Privacy Guarantee Pill */}
          <motion.div
            className="hero-privacy-claim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Lock size={14} />
            "Proving valid reports & volunteer credentials with zero PII exposure"
          </motion.div>
        </motion.div>

        {/* Dynamic Platform Stats */}
        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: totalReports, label: 'Crime Reports', icon: <FileText size={14} /> },
            { value: verifiedReports, label: 'ZK Verified Crimes', icon: <CheckCircle size={14} /> },
            { value: totalVolunteers, label: 'Attested Volunteers', icon: <UserCheck size={14} /> },
            { value: activeVolunteers, label: 'Active Certifications', icon: <BadgeCheck size={14} /> },
          ].map(s => (
            <div key={s.label} className="stat-pill">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                {s.icon}
                <span className="stat-pill-value">{s.value}</span>
              </div>
              <span className="stat-pill-label">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Platform Modules Section ──────────────────────────────── */}
      <section className="section">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="section-title">SafeCity Dual-Module Architecture</h2>
          <p className="section-subtitle">
            Two specialized zero-knowledge modules engineered for municipal security, whistleblower protection, and civic volunteer mobilization.
          </p>
        </div>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {PLATFORM_MODULES.map(mod => (
            <motion.div
              key={mod.id}
              className="feature-card"
              style={{
                '--feature-color': mod.color,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
              } as React.CSSProperties}
              whileHover={{ y: -4 }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div className="feature-icon" style={{ margin: 0 }}>{mod.icon}</div>
                  <span className="badge badge-accent" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {mod.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>{mod.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  {mod.tagline}
                </p>
                <p style={{ fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.25rem' }}>{mod.desc}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {mod.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                      <CheckCircle size={14} style={{ color: mod.color, flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                {mod.links.map(l => (
                  <button
                    key={l.label}
                    className={`btn ${l.primary ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => navigate(l.to)}
                  >
                    {l.label}
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Selective Disclosure Matrix ───────────────────────────── */}
      <section className="section">
        <h2 className="section-title">Selective Disclosure & Privacy Model</h2>
        <p className="section-subtitle">
          Midnight Protocol private state witnesses keep sensitive attributes encrypted locally. Only cryptographic conclusions are verifiable on-chain.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {SELECTIVE_DISCLOSURE_MATRIX.map(matrix => (
            <div
              key={matrix.category}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
                {matrix.category}
              </h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--red)', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={13} /> Never Revealed (Midnight Private State)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {matrix.hidden.map(item => (
                    <div
                      key={item}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.82rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: 'var(--red)' }}>✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--green)', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Eye size={13} /> Publicly Verifiable (On-Chain Selective Disclosure)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {matrix.revealed.map(item => (
                    <div
                      key={item}
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.75rem',
                        fontSize: '0.82rem',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: 'var(--green)' }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Core Technology Pillars ───────────────────────────────── */}
      <section className="section">
        <h2 className="section-title">Platform Capabilities</h2>
        <p className="section-subtitle">
          Engineered for performance, zero-leakage cryptography, and seamless end-user accessibility.
        </p>

        <div className="features-grid">
          {CORE_PILLARS.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              style={{ '--feature-color': f.color } as React.CSSProperties}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Call to Action ────────────────────────────────────────── */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Build Safer Communities with SafeCity</h2>
          <p>
            Report security incidents without fear of retaliation, or verify emergency volunteers without compromising their personal identity.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(isConnected ? '/submit' : '/connect')}
            >
              {isConnected ? 'Submit Incident Report' : 'Connect Lace Wallet'}
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/volunteer')}
            >
              <UserCheck size={18} />
              Verify Volunteer Status
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

