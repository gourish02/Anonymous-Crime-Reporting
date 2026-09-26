// =============================================================================
// ConnectWalletPage — Lace wallet connection / disconnection UI
// =============================================================================

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet, Power, Loader2, ExternalLink,
  ShieldCheck, CheckCircle, AlertTriangle, Copy,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { PrivacyBadge } from '@/components/PrivacyBadge'
import toast from 'react-hot-toast'

export function ConnectWalletPage() {
  const {
    walletStatus, walletInfo, laceInstalled,
    connectWallet, disconnectWallet, isConnected, networkId,
  } = useApp()
  const navigate = useNavigate()



  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address)
      toast.success('Address copied!')
    }
  }

  return (
    <div className="page connect-page">
      <div className="connect-container">
        {/* Header */}
        <motion.div
          className="connect-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="connect-icon">
            <Wallet size={36} />
          </div>
          <h1>Wallet Dashboard</h1>
          <p>Connect your Lace Wallet to submit and verify anonymous crime reports.</p>
        </motion.div>

        {/* Status card */}
        <motion.div
          className="wallet-status-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* ── Connected ── */}
          {isConnected && walletInfo ? (
            <div className="wallet-connected-info">
              <div className="wci-header">
                <CheckCircle size={22} className="text-green" />
                <span className="wci-status">Connected</span>
                <span className="network-pill">{networkId}</span>
              </div>

              <div className="wci-field">
                <label>Address</label>
                <div className="wci-address-row">
                  <code className="wci-address">{walletInfo.address}</code>
                  <button className="icon-btn" onClick={copyAddress} title="Copy">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="wci-field">
                <label>Balance</label>
                <span className="wci-balance">
                  {(Number(walletInfo.balance) / 1_000_000).toFixed(6)} DUST
                </span>
              </div>

              <PrivacyBadge variant="banner" />

              <div className="wci-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/submit')}
                >
                  <ShieldCheck size={16} /> Submit Report
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={disconnectWallet}
                >
                  <Power size={16} /> Disconnect
                </button>
              </div>
            </div>
          ) : walletStatus === 'connecting' ? (
            /* ── Connecting ── */
            <div className="wallet-connecting-state">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              >
                <Loader2 size={40} className="text-lavender" />
              </motion.div>
              <h3>Connecting to Lace…</h3>
              <p>Please approve the connection in your Lace Wallet extension.</p>
            </div>
          ) : !laceInstalled ? (
            /* ── Not installed ── */
            <div className="wallet-not-installed">
              <AlertTriangle size={40} className="text-amber" />
              <h3>Lace Wallet Not Found</h3>
              <p>
                Install the Lace Wallet browser extension to use this dApp.
                Lace is the official wallet for the Midnight blockchain.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <a
                  href="https://www.lace.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <ExternalLink size={16} /> Install Lace Wallet
                </a>
                <button
                  className="btn btn-outline"
                  onClick={connectWallet}
                >
                  <ShieldCheck size={16} /> Try Demo Wallet (Testnet)
                </button>
              </div>
            </div>
          ) : (
            /* ── Disconnected ── */
            <div className="wallet-disconnected-state">
              <div className="wallet-logo">
                <Wallet size={48} />
              </div>
              <h3>Connect Lace Wallet</h3>
              <p>
                Your wallet connection is kept private. Only anonymized on-chain
                data is ever visible to the public.
              </p>

              <motion.button
                className="btn btn-primary btn-lg connect-cta"
                onClick={connectWallet}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Wallet size={20} />
                Connect with Lace
              </motion.button>

              {walletStatus === 'error' && (
                <p className="connect-error">
                  <AlertTriangle size={14} /> Connection failed. Try again.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Info cards */}
        <div className="connect-info-grid">
          {[
            { icon: '🔐', title: 'Wallet stays private', desc: 'Your address is never posted on-chain.' },
            { icon: '⚡', title: 'Midnight Preprod', desc: 'Connected to the Midnight testnet.' },
            { icon: '🛡️', title: 'ZK Protected', desc: 'Every action generates a zero-knowledge proof.' },
          ].map(c => (
            <div key={c.title} className="connect-info-card">
              <span>{c.icon}</span>
              <strong>{c.title}</strong>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
