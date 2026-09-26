// =============================================================================
// Navbar — top navigation with wallet status indicator
// =============================================================================

import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Home, Wallet, FileText,
  CheckCircle, History, Power, Loader2, Menu, X, Sparkles, UserCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import clsx from 'clsx'

const NAV_LINKS = [
  { to: '/',           label: 'Home',             icon: <Home        size={16} /> },
  { to: '/classifier', label: 'AI Classifier',    icon: <Sparkles    size={16} /> },
  { to: '/submit',     label: 'Submit',           icon: <FileText    size={16} /> },
  { to: '/verify',     label: 'Verify',           icon: <CheckCircle size={16} /> },
  { to: '/volunteer',  label: 'Volunteers',       icon: <UserCheck   size={16} /> },
  { to: '/history',    label: 'History',          icon: <History     size={16} /> },
  { to: '/connect',    label: 'Wallet',           icon: <Wallet      size={16} /> },
]

export function Navbar() {
  const { walletStatus, walletInfo, connectWallet, disconnectWallet, laceInstalled } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const shortAddr = walletInfo?.address
    ? `${walletInfo.address.slice(0, 6)}…${walletInfo.address.slice(-4)}`
    : null

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <button
          className="navbar-brand"
          onClick={() => navigate('/')}
        >
          <div className="brand-icon-sm">
            <ShieldCheck size={22} />
          </div>
          <span className="brand-name-sm">SafeCity</span>
        </button>

        {/* Desktop nav links */}
        <ul className="nav-links">
          {NAV_LINKS.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  clsx('nav-link', isActive && 'nav-link--active')
                }
              >
                {l.icon}
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Wallet chip */}
        <div className="navbar-right">
          {walletStatus === 'connected' && walletInfo ? (
            <div className="wallet-chip">
              <span className="wallet-dot" />
              <span className="wallet-chip-addr">{shortAddr}</span>
              <button
                className="wallet-chip-disconnect"
                onClick={disconnectWallet}
                title="Disconnect"
              >
                <Power size={13} />
              </button>
            </div>
          ) : walletStatus === 'connecting' ? (
            <div className="wallet-chip wallet-chip--loading">
              <Loader2 size={14} className="spin" />
              <span>Connecting…</span>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={laceInstalled ? connectWallet : () => navigate('/connect')}
            >
              <Wallet size={14} />
              {laceInstalled ? 'Connect' : 'Get Lace'}
            </button>
          )}

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  clsx('mobile-link', isActive && 'mobile-link--active')
                }
                onClick={() => setMenuOpen(false)}
              >
                {l.icon}
                {l.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
