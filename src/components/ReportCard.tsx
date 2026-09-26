// =============================================================================
// ReportCard — card for the report history list
// =============================================================================

import { motion } from 'framer-motion'
import { ThumbsUp, Clock, Calendar, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { PrivacyBadge } from './PrivacyBadge'
import type { PublicReport } from '@/types'
import { CRIME_TYPES, CRIME_TYPE_ICONS, REPORT_STATUS, STATUS_COLORS } from '@/types'
import clsx from 'clsx'

interface ReportCardProps {
  report:  PublicReport
  index:   number
  onVerify?: (id: bigint) => Promise<void>
  onUpvote?: (id: bigint) => Promise<void>
}

export function ReportCard({ report, index, onVerify, onUpvote }: ReportCardProps) {
  const [upvoting,  setUpvoting]  = useState(false)
  const [verifying, setVerifying] = useState(false)

  const statusColor = STATUS_COLORS[report.status]
  const statusLabel = REPORT_STATUS[report.status]
  const crimeLabel  = CRIME_TYPES[report.crimeType]
  const crimeIcon   = CRIME_TYPE_ICONS[report.crimeType]

  const handleUpvote = async () => {
    if (!onUpvote) return
    setUpvoting(true)
    try { await onUpvote(report.id) }
    finally { setUpvoting(false) }
  }

  const handleVerify = async () => {
    if (!onVerify) return
    setVerifying(true)
    try { await onVerify(report.id) }
    finally { setVerifying(false) }
  }

  return (
    <motion.article
      className="report-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      {/* Status stripe */}
      <div
        className="report-card-stripe"
        style={{ background: statusColor }}
      />

      <div className="report-card-body">
        {/* Header row */}
        <div className="report-card-header">
          <span className="report-crime-icon">{crimeIcon}</span>
          <div className="report-card-title">
            <h3>{crimeLabel}</h3>
            <span className="report-id-tag">#{report.id.toString()}</span>
          </div>
          <PrivacyBadge variant="inline" />
        </div>

        {/* Meta row */}
        <div className="report-card-meta">
          <span>
            <Calendar size={12} />
            {format(new Date(Number(report.dateTimestamp)), 'MMM dd, yyyy')}
          </span>
          <span>
            <Clock size={12} />
            {format(new Date(Number(report.submittedAt)), 'HH:mm')}
          </span>
          {report.hasEvidence && (
            <span className="evidence-tag">📎 Evidence</span>
          )}
        </div>

        {/* Status */}
        <div className="report-card-status">
          <span
            className="status-pill"
            style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}10` }}
          >
            {report.verified
              ? <ShieldCheck size={12} />
              : <AlertCircle size={12} />}
            {statusLabel}
          </span>
          {report.verified && (
            <span className="verified-proof-tag">ZK Verified ✓</span>
          )}
        </div>

        {/* Footer */}
        <div className="report-card-footer">
          <button
            className={clsx('upvote-btn', upvoting && 'upvote-btn--loading')}
            onClick={handleUpvote}
            disabled={upvoting}
          >
            {upvoting
              ? <Loader2 size={13} className="spin" />
              : <ThumbsUp size={13} />}
            {report.upvotes}
          </button>

          {report.status === 0 && onVerify && (
            <button
              className="verify-btn-sm"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying
                ? <><Loader2 size={12} className="spin" /> Verifying…</>
                : <><ShieldCheck size={12} /> Verify</>}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
