// ─────────────────────────────────────────────────────────────────────────────
// PrivacyIndicator — visualises the ZK proof privacy guarantee
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldCheck, Lock, Eye, EyeOff, Cpu } from 'lucide-react'
import type { ProofMetadata } from '@/types'

interface PrivacyIndicatorProps {
  isSubmitting: boolean
  lastProof: ProofMetadata | null
}

export function PrivacyIndicator({ isSubmitting, lastProof }: PrivacyIndicatorProps) {
  return (
    <div className="privacy-panel">
      {/* Header */}
      <div className="privacy-header">
        <ShieldCheck size={20} className="text-green" />
        <h3>Privacy Layer</h3>
      </div>

      {/* What stays private */}
      <div className="privacy-rows">
        <PrivacyRow icon={<EyeOff size={14} />} label="Your identity" status="private" />
        <PrivacyRow icon={<EyeOff size={14} />} label="Wallet address" status="private" />
        <PrivacyRow icon={<EyeOff size={14} />} label="Witness data" status="private" />
        <PrivacyRow icon={<Eye size={14} />} label="Crime type" status="public" />
        <PrivacyRow icon={<Eye size={14} />} label="Area code" status="public" />
        <PrivacyRow icon={<Eye size={14} />} label="Severity" status="public" />
      </div>

      {/* ZK proof animation / result */}
      <div className="proof-status">
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="proving"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="proof-generating"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <Cpu size={22} />
              </motion.div>
              <span>Generating ZK proof…</span>
              <ProofProgressBar />
            </motion.div>
          ) : lastProof ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="proof-done"
            >
              <Lock size={18} className="text-green" />
              <div className="proof-meta">
                <span className="proof-label">Last Proof</span>
                <span className="proof-stat">{lastProof.proofSizeBytes} bytes</span>
                <span className="proof-stat">{lastProof.generationTimeMs} ms</span>
                {lastProof.txHash && (
                  <span className="proof-stat proof-hash">
                    {lastProof.txHash.slice(0, 12)}…
                  </span>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="proof-verified"
              >
                <ShieldCheck size={16} />
                Verified
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="proof-idle"
            >
              <Shield size={18} />
              <span>ZK proof generated per submission</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface PrivacyRowProps {
  icon: React.ReactNode
  label: string
  status: 'private' | 'public'
}

function PrivacyRow({ icon, label, status }: PrivacyRowProps) {
  return (
    <div className={`privacy-row privacy-row--${status}`}>
      <span className="privacy-row-icon">{icon}</span>
      <span className="privacy-row-label">{label}</span>
      <span className={`privacy-badge privacy-badge--${status}`}>
        {status}
      </span>
    </div>
  )
}

function ProofProgressBar() {
  return (
    <div className="proof-progress">
      <motion.div
        className="proof-progress-fill"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />
    </div>
  )
}
