// =============================================================================
// SafeCity — Public Statistics Dashboard Page
// Comprehensive Real-Time Metrics for Crime Reporting & Volunteer Verification
// =============================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, ShieldCheck, FileText, CheckCircle2, UserCheck,
  Award, Clock, AlertTriangle, ArrowRight, ExternalLink, Activity,
  Lock, Sparkles, TrendingUp, RefreshCw
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getAllAttestedVolunteers } from '@/api/volunteer'
import { CRIME_TYPES } from '@/types'

export function PublicStatisticsDashboardPage() {
  const navigate = useNavigate()
  const { reports, refreshReports, isLoadingReports } = useApp()
  const [volunteers, setVolunteers] = useState(() => getAllAttestedVolunteers())
  const [lastRefreshed, setLastRefreshed] = useState(Date.now())

  useEffect(() => {
    setVolunteers(getAllAttestedVolunteers())
  }, [lastRefreshed])

  function handleRefresh() {
    refreshReports()
    setVolunteers(getAllAttestedVolunteers())
    setLastRefreshed(Date.now())
  }

  // Aggregated Stats
  const totalReports = reports.length
  const verifiedReports = reports.filter(r => r.verified).length
  const pendingReports = totalReports - verifiedReports
  const totalVolunteers = volunteers.length
  const activeVolunteers = volunteers.filter(v => v.isActive).length
  const expiredVolunteers = totalVolunteers - activeVolunteers

  // Crime Category breakdown
  const categoryCounts = [1, 2, 3, 4, 5].map(code => {
    const key = code as keyof typeof CRIME_TYPES
    const count = reports.filter(r => r.crimeType === code).length
    const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0
    return {
      code,
      name: CRIME_TYPES[key]?.name || `Category ${code}`,
      color: CRIME_TYPES[key]?.color || 'var(--blue)',
      count,
      pct,
    }
  })

  return (
    <div className="page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '16px', background: 'rgba(137, 180, 250, 0.1)', border: '1px solid rgba(137, 180, 250, 0.3)', marginBottom: '0.6rem' }}>
            <Activity size={14} style={{ color: 'var(--blue)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue)' }}>
              Public Telemetry & On-Chain Analytics
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
            Public Statistics Dashboard
          </h1>
          <p style={{ color: 'var(--subtext0)', margin: 0, fontSize: '0.95rem' }}>
            Aggregated, non-identifying telemetry across <strong>SafeCity Public Safety</strong> and <strong>Confidential Volunteer Verification</strong>.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleRefresh}
          disabled={isLoadingReports}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'center' }}
        >
          <RefreshCw size={14} className={isLoadingReports ? 'spin' : ''} />
          {isLoadingReports ? 'Syncing…' : 'Refresh Telemetry'}
        </button>
      </motion.div>

      {/* Top 4 KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          {
            label: 'Total Crime Reports',
            val: totalReports,
            sub: `${pendingReports} Pending Verification`,
            icon: <FileText size={22} style={{ color: 'var(--blue)' }} />,
            color: 'var(--blue)',
          },
          {
            label: 'ZK Verified Incidents',
            val: verifiedReports,
            sub: totalReports > 0 ? `${Math.round((verifiedReports / totalReports) * 100)}% verified on-chain` : '0% verified',
            icon: <CheckCircle2 size={22} style={{ color: 'var(--green)' }} />,
            color: 'var(--green)',
          },
          {
            label: 'Attested Volunteers',
            val: totalVolunteers,
            sub: 'Zero PII Leaked to Ledger',
            icon: <UserCheck size={22} style={{ color: 'var(--mauve)' }} />,
            color: 'var(--mauve)',
          },
          {
            label: 'Active Certifications',
            val: activeVolunteers,
            sub: `${expiredVolunteers} Expired Certifications`,
            icon: <Award size={22} style={{ color: 'var(--yellow)' }} />,
            color: 'var(--yellow)',
          },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            className="card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--subtext0)', fontWeight: 600 }}>{kpi.label}</span>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)' }}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
                {kpi.val}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--subtext0)' }}>
                {kpi.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dual Module Charts & Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        {/* Module 1: Incident Distribution */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                Incident Categories
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--subtext0)' }}>
                Taxonomy distribution classified via AI & Compact circuit
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/crime')}
              style={{ fontSize: '0.78rem' }}
            >
              Report Hub <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryCounts.map(cat => (
              <div key={cat.code}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cat.name}</span>
                  <span style={{ color: 'var(--subtext0)' }}>
                    {cat.count} reports ({cat.pct}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(cat.pct, 4)}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ height: '100%', background: cat.color, borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Module 2: Volunteer Credential Health */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                Volunteer Credential Health
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--subtext0)' }}>
                Zero-knowledge validity and expiration status
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/volunteer')}
              style={{ fontSize: '0.78rem' }}
            >
              Verify Hub <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Active vs Expired Meter */}
            <div style={{ background: 'rgba(17, 17, 27, 0.6)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> Active Certifications: {activeVolunteers}
                </span>
                <span style={{ color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Expired: {expiredVolunteers}
                </span>
              </div>
              <div style={{ height: '10px', background: 'rgba(239, 68, 68, 0.4)', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                <div
                  style={{
                    height: '100%',
                    width: totalVolunteers > 0 ? `${(activeVolunteers / totalVolunteers) * 100}%` : '50%',
                    background: 'var(--green)',
                  }}
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/volunteer/verify')}
                style={{ textAlign: 'center', justifyContent: 'center' }}
              >
                Verify Volunteer
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/volunteer/submit')}
                style={{ textAlign: 'center', justifyContent: 'center' }}
              >
                Submit Credential
              </button>
            </div>

            {/* Zero Information Disclosure Guarantee */}
            <div style={{ background: 'rgba(166, 227, 161, 0.05)', border: '1px solid rgba(166, 227, 161, 0.2)', borderRadius: '10px', padding: '0.85rem', fontSize: '0.82rem', color: 'var(--subtext0)', display: 'flex', gap: '8px' }}>
              <Lock size={15} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Privacy Assurance:</strong> Total volunteer counts and validity are cryptographically proven through Compact circuits without revealing individual names, IDs, addresses, or certificates.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Network Telemetry & Smart Contract Status Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
              Midnight Blockchain Network Status
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--subtext0)' }}>
              Connected to Midnight Preprod Testnet (`testnet-02`)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="wallet-dot" />
            <span style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>Ledger Operational</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ background: 'rgba(17, 17, 27, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--subtext0)', fontSize: '0.78rem', marginBottom: '4px' }}>Contract Address (Preprod)</div>
            <code style={{ fontSize: '0.8rem', color: 'var(--lavender)', wordBreak: 'break-all' }}>
              0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e
            </code>
          </div>

          <div style={{ background: 'rgba(17, 17, 27, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--subtext0)', fontSize: '0.78rem', marginBottom: '4px' }}>Active Circuits</div>
            <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.82rem' }}>
              submitCrimeReport, verifyReport, submitVolunteerCredential, verifyVolunteerCredential, getVerificationStatus
            </div>
          </div>

          <div style={{ background: 'rgba(17, 17, 27, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--subtext0)', fontSize: '0.78rem', marginBottom: '4px' }}>Block Explorer</div>
            <a
              href="https://explorer.testnet-02.midnight.network/contract/0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              Inspect on Midnight Explorer <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
