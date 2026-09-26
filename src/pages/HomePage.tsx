// =============================================================================
// HomePage — landing page with hero, feature cards, and live stats
// =============================================================================

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, FileText, CheckCircle, History,
  Lock, Eye, Zap, ArrowRight, Users, Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

const FEATURES = [
  {
    icon: <Sparkles size={24} />,
    title: 'AI Crime Classifier',
    desc:  'FastAPI + Scikit-Learn pipeline classifies descriptions into 5 categories, calculates calibrated confidence, and assesses risk.',
    color: 'var(--mauve)',
  },
  {
    icon: <Lock size={24} />,
    title: 'Zero-Knowledge Privacy',
    desc:  'Your identity is mathematically provable without ever being revealed. Reporter keys stay in local witnesses.',
    color: 'var(--blue)',
  },
  {
    icon: <Eye size={24} />,
    title: 'Public Verification',
    desc:  'Community can verify reports are legitimate without knowing who submitted them. Only Report ID and status are public.',
    color: 'var(--green)',
  },
  {
    icon: <Zap size={24} />,
    title: 'Midnight Blockchain',
    desc:  'Built on Midnight Protocol — the only blockchain designed for data protection using Compact ZK circuits.',
    color: 'var(--yellow)',
  },
  {
    icon: <Users size={24} />,
    title: 'Anonymous Upvoting',
    desc:  'Community members can corroborate reports via ZK-attested upvotes without revealing who they are.',
    color: 'var(--teal)',
  },
]

const PRIVACY_FLOW = [
  { label: 'Your Identity',  status: 'private', icon: '🔒' },
  { label: 'Location',       status: 'private', icon: '📍' },
  { label: 'Description',    status: 'private', icon: '📝' },
  { label: 'Crime Type',     status: 'public',  icon: '📋' },
  { label: 'Report ID',      status: 'public',  icon: '🆔' },
  { label: 'Verified Status',status: 'public',  icon: '✅' },
]

export function HomePage() {
  const navigate  = useNavigate()
  const { isConnected, reports } = useApp()

  const totalReports   = reports.length
  const verifiedCount  = reports.filter(r => r.verified).length
  const criticalCount  = reports.filter(r => r.crimeType >= 2 && r.crimeType <= 3).length

  return (
    <div className="page home-page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-eyebrow">
            <ShieldCheck size={14} /> Midnight Blockchain · Zero-Knowledge Proofs
          </div>

          <h1 className="hero-heading">
            Anonymous Crime
            <br />
            <span className="gradient-text">Reporting & Verification</span>
          </h1>

          <p className="hero-sub">
            Submit crime reports with full anonymity guaranteed by cryptographic
            zero-knowledge proofs. Your identity is <em>mathematically impossible</em> to reveal.
          </p>

          <div className="hero-actions">
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate(isConnected ? '/submit' : '/connect')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={18} />
              {isConnected ? 'Submit a Report' : 'Get Started'}
              <ArrowRight size={16} />
            </motion.button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/classifier')}
            >
              <Sparkles size={18} /> AI Classifier
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/history')}
            >
              <History size={18} /> View Reports
            </button>
          </div>

          {/* Privacy claim banner */}
          <motion.div
            className="hero-privacy-claim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Lock size={14} />
            "Report verified without revealing reporter identity"
          </motion.div>
        </motion.div>

        {/* Stats */}
        {isConnected && (
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { value: totalReports,  label: 'Total Reports' },
              { value: verifiedCount, label: 'ZK Verified' },
              { value: criticalCount, label: 'Critical' },
            ].map(s => (
              <div key={s.label} className="stat-pill">
                <span className="stat-pill-value">{s.value}</span>
                <span className="stat-pill-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── Privacy Flow ──────────────────────────────────────────── */}
      <section className="section">
        <h2 className="section-title">What's Private vs Public</h2>
        <p className="section-subtitle">
          Only non-identifying metadata is written to the blockchain.
          All personal data stays in the ZK witness — mathematically hidden.
        </p>
        <div className="privacy-flow-grid">
          {PRIVACY_FLOW.map((item, i) => (
            <motion.div
              key={item.label}
              className={`privacy-flow-card privacy-flow-card--${item.status}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <span className="privacy-flow-icon">{item.icon}</span>
              <span className="privacy-flow-label">{item.label}</span>
              <span className={`privacy-flow-badge privacy-flow-badge--${item.status}`}>
                {item.status === 'private' ? '🔒 Private' : '🌐 Public'}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{ '--feature-color': f.color } as React.CSSProperties}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Ready to report anonymously?</h2>
          <p>Connect your Lace Wallet to begin. Your identity will never leave your device.</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate(isConnected ? '/submit' : '/connect')}
          >
            {isConnected ? 'Submit Report' : 'Connect Lace Wallet'}
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>
    </div>
  )
}
