// =============================================================================
// ReportHistoryPage — paginated list of all on-chain reports
// =============================================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  History, RefreshCw, Search, Filter,
  Loader2, AlertTriangle, ShieldCheck,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { ReportCard } from '@/components/ReportCard'
import { CRIME_TYPES, REPORT_STATUS, STATUS_COLORS } from '@/types'
import type { CrimeTypeKey, StatusKey } from '@/types'

const PAGE_SIZE = 6

export function ReportHistoryPage() {
  const { isConnected, reports, isLoadingReports, refreshReports, verifyReport, connectWallet } = useApp()
  const navigate = useNavigate()

  const [search,        setSearch]        = useState('')
  const [filterType,    setFilterType]    = useState<CrimeTypeKey | -1>(-1)
  const [filterStatus,  setFilterStatus]  = useState<StatusKey | -1>(-1)
  const [page,          setPage]          = useState(0)

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = reports.filter(r => {
    if (filterType   !== -1 && r.crimeType !== filterType)   return false
    if (filterStatus !== -1 && r.status    !== filterStatus)  return false
    if (search && !r.id.toString().includes(search))          return false
    return true
  })

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const pageReports = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const handleVerify = async (id: bigint) => {
    await verifyReport(id)
  }

  if (!isConnected) {
    return (
      <div className="page page-guard">
        <motion.div className="guard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={40} className="text-amber" />
          <h2>Wallet Not Connected</h2>
          <p>Connect your Lace Wallet to view report history.</p>
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
    <div className="page history-page">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header history-header">
        <div>
          <div className="page-title-row">
            <History size={24} className="text-lavender" />
            <h1>Report History</h1>
          </div>
          <p>{reports.length} reports on-chain · {reports.filter(r=>r.verified).length} verified</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={refreshReports}
          disabled={isLoadingReports}
        >
          <RefreshCw size={15} className={isLoadingReports ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="history-filters">
        {/* Search by ID */}
        <div className="filter-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by Report ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="filter-input"
          />
        </div>

        {/* Crime type filter */}
        <div className="filter-select-wrap">
          <Filter size={14} />
          <select
            className="filter-select"
            value={filterType}
            onChange={e => { setFilterType(Number(e.target.value) as CrimeTypeKey | -1); setPage(0) }}
          >
            <option value={-1}>All Crime Types</option>
            {(Object.entries(CRIME_TYPES) as [string, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="filter-select-wrap">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => { setFilterStatus(Number(e.target.value) as StatusKey | -1); setPage(0) }}
          >
            <option value={-1}>All Statuses</option>
            {(Object.entries(REPORT_STATUS) as [string, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Status legend */}
        <div className="status-legend">
          {(Object.entries(STATUS_COLORS) as [string, string][]).map(([k, color]) => (
            <span key={k} className="legend-pill" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
              {REPORT_STATUS[Number(k) as StatusKey]}
            </span>
          ))}
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────── */}
      {isLoadingReports ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin text-lavender" />
          <p>Loading reports from chain…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <ShieldCheck size={40} />
          <h3>No Reports Found</h3>
          <p>{search || filterType !== -1 || filterStatus !== -1
            ? 'No reports match your filters.'
            : 'No reports on-chain yet. Be the first to submit anonymously!'
          }</p>
          {!search && filterType === -1 && filterStatus === -1 && (
            <button className="btn btn-primary" onClick={() => navigate('/submit')}>
              Submit a Report
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="reports-grid-history">
            {pageReports.map((r, i) => (
              <ReportCard
                key={r.id.toString()}
                report={r}
                index={i}
                onVerify={handleVerify}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                ← Prev
              </button>
              <div className="pagination-dots">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`pagination-dot ${i === page ? 'active' : ''}`}
                    onClick={() => setPage(i)}
                  />
                ))}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
