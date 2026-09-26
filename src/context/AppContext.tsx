// =============================================================================
// Global App Context — wallet state + reports + submission history
// =============================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import {
  isLaceInstalled,
  connectWallet   as sdkConnect,
  disconnectWallet as sdkDisconnect,
  submitCrimeReport as sdkSubmit,
  verifyReport      as sdkVerify,
  getReportStatus   as sdkStatus,
  generateMockReports,
} from '@/api/midnight'
import type {
  WalletConnectionStatus,
  WalletInfo,
  PublicReport,
  ReportFormData,
  SubmissionResult,
  VerificationResult,
  NetworkId,
} from '@/types'
import { DEFAULT_NETWORK_ID } from '@/config/networks'

// ── Context shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  // Wallet
  walletStatus:    WalletConnectionStatus
  walletInfo:      WalletInfo | null
  laceInstalled:   boolean
  connectWallet:   () => Promise<void>
  disconnectWallet: () => void
  isConnected:     boolean

  // Reports
  reports:         PublicReport[]
  isLoadingReports: boolean
  refreshReports:  () => void

  // Submission
  isSubmitting:    boolean
  lastSubmission:  SubmissionResult | null
  submitReport:    (form: ReportFormData) => Promise<SubmissionResult | null>

  // Verification
  isVerifying:     boolean
  lastVerification: VerificationResult | null
  verifyReport:    (reportId: bigint) => Promise<VerificationResult | null>
  checkStatus:     (reportId: bigint) => Promise<void>

  // Network
  networkId:       NetworkId
}

const AppContext = createContext<AppContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletStatus, setWalletStatus]       = useState<WalletConnectionStatus>('disconnected')
  const [walletInfo,   setWalletInfo]         = useState<WalletInfo | null>(null)
  const [laceInstalled, setLaceInstalled]     = useState(false)
  const [reports,       setReports]           = useState<PublicReport[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [isSubmitting,  setIsSubmitting]      = useState(false)
  const [lastSubmission, setLastSubmission]   = useState<SubmissionResult | null>(null)
  const [isVerifying,   setIsVerifying]       = useState(false)
  const [lastVerification, setLastVerification] = useState<VerificationResult | null>(null)

  const networkId: NetworkId =
    (walletInfo?.networkId ?? DEFAULT_NETWORK_ID) as NetworkId

  // Detect Lace on mount
  useEffect(() => {
    const check = () => setLaceInstalled(isLaceInstalled())
    check()
    const t = setTimeout(check, 600)
    return () => clearTimeout(t)
  }, [])

  // Load reports when wallet connects
  const refreshReports = useCallback(() => {
    setIsLoadingReports(true)
    setTimeout(() => {
      setReports(generateMockReports(12))
      setIsLoadingReports(false)
    }, 900)
  }, [])

  useEffect(() => {
    if (walletStatus === 'connected') refreshReports()
  }, [walletStatus, refreshReports])

  // ── Wallet actions ─────────────────────────────────────────────────────────

  const connectWallet = useCallback(async () => {
    setWalletStatus('connecting')
    try {
      const info = await sdkConnect()
      setWalletInfo(info as WalletInfo)
      setWalletStatus('connected')
      if (isLaceInstalled()) {
        toast.success('Lace Wallet connected!', { icon: '🔐' })
      } else {
        toast.success('Connected in Testnet Demo Mode', { icon: '⚡' })
      }
    } catch (err) {
      setWalletStatus('error')
      toast.error(`Connection failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    sdkDisconnect()
    setWalletInfo(null)
    setWalletStatus('disconnected')
    setReports([])
    setLastSubmission(null)
    setLastVerification(null)
    toast('Wallet disconnected', { icon: '👋' })
  }, [])

  // ── Contract actions ───────────────────────────────────────────────────────

  const submitReport = useCallback(async (form: ReportFormData): Promise<SubmissionResult | null> => {
    setIsSubmitting(true)
    const toastId = toast.loading('Generating ZK proof & submitting…', { icon: '🔐' })
    try {
      const result = await sdkSubmit(form, networkId)
      setLastSubmission(result)

      // Optimistically add to local reports list
      const newReport: PublicReport = {
        id:            result.reportId,
        crimeType:     form.crimeType,
        dateTimestamp: BigInt(new Date(form.date).getTime()),
        submittedAt:   BigInt(result.timestamp),
        status:        0,
        verified:      false,
        upvotes:       0,
        hasEvidence:   form.evidenceHash.trim().length > 0,
      }
      setReports(prev => [newReport, ...prev])

      toast.success(
        `Report #${result.reportId} submitted anonymously — proof: ${result.proof.proofSizeBytes}B in ${result.proof.generationTimeMs}ms`,
        { id: toastId, duration: 8000, icon: '✅' }
      )
      return result
    } catch (err) {
      toast.error(`Submission failed: ${err instanceof Error ? err.message : String(err)}`, { id: toastId })
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [networkId])

  const verifyReport = useCallback(async (reportId: bigint): Promise<VerificationResult | null> => {
    setIsVerifying(true)
    const toastId = toast.loading(`Verifying report #${reportId}…`, { icon: '🔍' })
    try {
      const result = await sdkVerify(reportId, networkId)
      setLastVerification(result)
      setReports(prev =>
        prev.map(r =>
          r.id === reportId ? { ...r, status: 1, verified: true } : r
        )
      )
      toast.success(`"${result.privacyClaim}"`, { id: toastId, duration: 8000, icon: '🛡️' })
      return result
    } catch (err) {
      toast.error(`Verification failed: ${err instanceof Error ? err.message : String(err)}`, { id: toastId })
      return null
    } finally {
      setIsVerifying(false)
    }
  }, [networkId])

  const checkStatus = useCallback(async (reportId: bigint) => {
    const toastId = toast.loading(`Fetching status for #${reportId}…`)
    try {
      const status = await sdkStatus(reportId, networkId)
      toast.success(`Report #${reportId} status: ${status}`, { id: toastId })
    } catch (err) {
      toast.error(String(err), { id: toastId })
    }
  }, [networkId])

  const value: AppContextValue = {
    walletStatus, walletInfo, laceInstalled,
    connectWallet, disconnectWallet,
    isConnected: walletStatus === 'connected',
    reports, isLoadingReports, refreshReports,
    isSubmitting, lastSubmission, submitReport,
    isVerifying, lastVerification, verifyReport,
    checkStatus,
    networkId,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
