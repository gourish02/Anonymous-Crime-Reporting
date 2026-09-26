// =============================================================================
// SafeCity — Crime Reporting Portal Page
// Unified hub for anonymous crime submission, ZK verification, history, & AI lab
// =============================================================================

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, CheckCircle2, History, Sparkles, ShieldCheck,
  Lock, ArrowRight, AlertTriangle, Eye, Shield, ShieldAlert
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

const CRIME_SECTIONS = [
  {
    title: 'Submit Crime Report',
    desc: 'Submit incident reports anonymously with zero-knowledge cryptographic proofs. Identity and narrative are never disclosed on-chain.',
    path: '/submit',
    icon: <FileText size={26} style={{ color: 'var(--blue)' }} />,
    color: 'var(--blue)',
    actionLabel: 'Submit Anonymously',
  },
  {
    title: 'Age Eligibility (18+)',
    desc: 'Prove you are at least 18 years old using Midnight zero-knowledge proofs before accessing report submission. DOB remains hidden.',
    path: '/age-verify',
    icon: <ShieldAlert size={26} style={{ color: 'var(--yellow)' }} />,
    color: 'var(--yellow)',
    actionLabel: 'Verify Age',
  },
  {
    title: 'Verify Incident Report',
    desc: 'Verify the authenticity and on-chain ledger confirmation of submitted crime reports using the Compact verifyReport circuit.',
    path: '/verify',
    icon: <CheckCircle2 size={26} style={{ color: 'var(--green)' }} />,
    color: 'var(--green)',
    actionLabel: 'Verify Report',
  },
  {
    title: 'AI Threat Classifier',
    desc: 'Real-time incident categorization and multi-factor risk assessment powered by FastAPI and Scikit-Learn machine learning.',
    path: '/classifier',
    icon: <Sparkles size={26} style={{ color: 'var(--mauve)' }} />,
    color: 'var(--mauve)',
    actionLabel: 'Launch AI Lab',
  },
  {
    title: 'On-Chain Report History',
    desc: 'Explore the immutable public ledger of verified crime reports, category statistics, and community upvotes.',
    path: '/history',
    icon: <History size={26} style={{ color: 'var(--teal)' }} />,
    color: 'var(--teal)',
    actionLabel: 'Browse Ledger',
  },
]

export function CrimeReportingPortalPage() {
  const navigate = useNavigate()
  const { reports } = useApp()

  const totalReports = reports.length
  const verifiedCount = reports.filter(r => r.verified).length

  return (
    <div className="page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', background: 'rgba(137, 180, 250, 0.1)', border: '1px solid rgba(137, 180, 250, 0.3)', marginBottom: '0.8rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--blue)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--blue)' }}>
            SafeCity Protocol · Module 01
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Anonymous Crime Reporting
        </h1>
        <p style={{ color: 'var(--subtext0)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
          Decentralized civic protection powered by Midnight zero-knowledge proofs. Report security incidents without fear of retaliation.
        </p>

        {/* Quick telemetry */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="badge badge-accent" style={{ padding: '6px 14px' }}>
            Total Reports: {totalReports}
          </div>
          <div className="badge badge-success" style={{ padding: '6px 14px' }}>
            ZK Verified: {verifiedCount}
          </div>
        </div>
      </motion.div>

      {/* Grid of Crime Reporting Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {CRIME_SECTIONS.map((sec, idx) => (
          <motion.div
            key={sec.title}
            className="card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)' }}>
                  {sec.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                  {sec.title}
                </h3>
              </div>
              <p style={{ color: 'var(--subtext0)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                {sec.desc}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(sec.path)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span>{sec.actionLabel}</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Zero Knowledge Privacy Guarantee Box */}
      <div
        style={{
          background: 'rgba(17, 17, 27, 0.7)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
        }}
      >
        <Lock size={22} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--subtext0)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text)' }}>Whistleblower Privacy Architecture:</strong>
          <br />
          When submitting an incident report, your wallet address and incident description are salted and hashed strictly inside your browser's local witness memory. The Midnight Compact circuit writes only the public report sequence and cryptographic proof π to the ledger.
        </div>
      </div>
    </div>
  )
}
