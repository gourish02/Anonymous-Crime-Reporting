// =============================================================================
// PrivacyBadge — reusable "🔒 Anonymous" / privacy claim badge
// =============================================================================

import { motion } from 'framer-motion'
import { ShieldCheck, EyeOff, Lock } from 'lucide-react'
import clsx from 'clsx'

interface PrivacyBadgeProps {
  variant?: 'inline' | 'banner' | 'claim'
  claim?:   string
  className?: string
}

export function PrivacyBadge({
  variant = 'inline',
  claim = 'Reporter identity never revealed',
  className,
}: PrivacyBadgeProps) {
  if (variant === 'banner') {
    return (
      <motion.div
        className={clsx('privacy-banner', className)}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ShieldCheck size={18} />
        <div>
          <strong>Zero-Knowledge Privacy Active</strong>
          <p>Your identity is protected by cryptographic proof — it is mathematically impossible to extract from on-chain data.</p>
        </div>
      </motion.div>
    )
  }

  if (variant === 'claim') {
    return (
      <motion.div
        className={clsx('privacy-claim', className)}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="privacy-claim-icon"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <Lock size={28} />
        </motion.div>
        <p className="privacy-claim-text">"{claim}"</p>
        <div className="privacy-claim-proof">
          <EyeOff size={12} /> ZK Proof Verified
        </div>
      </motion.div>
    )
  }

  // inline (default)
  return (
    <span className={clsx('privacy-badge-inline', className)}>
      <EyeOff size={11} /> Anonymous
    </span>
  )
}
