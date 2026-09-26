// =============================================================================
// Shared TypeScript Types — Anonymous Crime Reporting dApp v2
// =============================================================================

// ── Network ──────────────────────────────────────────────────────────────────

export type NetworkId = 'preprod' | 'devnet' | 'mainnet'

export interface NetworkConfig {
  networkId: NetworkId
  label: string
  indexerUri: string
  proofServerUri: string
  rpcUri: string
  explorerBaseUrl: string
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

export interface WalletInfo {
  address: string
  balance: bigint
  networkId: NetworkId
}

// ── Crime Data ────────────────────────────────────────────────────────────────

export const CRIME_TYPES = {
  1: 'Theft',
  2: 'Assault',
  3: 'Cyber Crime',
  4: 'Fraud',
  5: 'Vandalism',
  0: 'Other',
} as const

export const CRIME_TYPE_ICONS: Record<number, string> = {
  0: '❓',
  1: '🔓', // Theft
  2: '⚠️', // Assault
  3: '💻', // Cyber Crime
  4: '💳', // Fraud
  5: '🪓', // Vandalism
}

// ── AI Crime Classifier Types ──────────────────────────────────────────────────

export type AICrimeCategory = 'Theft' | 'Assault' | 'Cyber Crime' | 'Fraud' | 'Vandalism'
export type AIRiskLevel     = 'Low' | 'Medium' | 'High' | 'Critical'

export interface AIClassificationResult {
  category:      AICrimeCategory
  categoryId:    number
  categoryIcon:  string
  riskLevel:     AIRiskLevel
  confidence:    number       // 0.0 to 1.0 (calibrated score)
  probabilities: Record<AICrimeCategory, number>
  riskFactors:   string[]
  explanation:   string
}

export interface AICategoryMeta {
  id:          number
  name:        string
  icon:        string
  base_risk:   string
  description: string
  examples:    string[]
}

export const REPORT_STATUS = {
  0: 'Pending',
  1: 'Verified',
  2: 'Rejected',
  3: 'Under Investigation',
} as const

export const STATUS_COLORS: Record<number, string> = {
  0: '#f59e0b', // amber  — pending
  1: '#22c55e', // green  — verified
  2: '#ef4444', // red    — rejected
  3: '#6366f1', // indigo — investigating
}

export const SEVERITY_LEVELS = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
  3: 'Critical',
} as const

export type CrimeTypeKey   = keyof typeof CRIME_TYPES
export type StatusKey      = keyof typeof REPORT_STATUS
export type SeverityKey    = keyof typeof SEVERITY_LEVELS

// ── Contract Types ────────────────────────────────────────────────────────────

/** Mirrors the on-chain PublicReport struct */
export interface PublicReport {
  id:            bigint
  crimeType:     CrimeTypeKey
  dateTimestamp: bigint       // Date of incident (unix ms)
  submittedAt:   bigint       // Time of on-chain submission (unix ms)
  status:        StatusKey
  verified:      boolean
  upvotes:       number
  hasEvidence:   boolean
}

/** Fields from the crime report submission form */
export interface ReportFormData {
  crimeType:    CrimeTypeKey
  location:     string        // Kept private — hashed in witness
  date:         string        // ISO date string
  description:  string        // Kept private — hashed in witness
  evidenceHash: string        // Optional IPFS hash / SHA256
}

/** ZK proof metadata returned after each circuit call */
export interface ProofMetadata {
  circuitName:       string
  proofSizeBytes:    number
  generationTimeMs:  number
  verifiedOnChain:   boolean
  txHash?:           string
}

/** Full submission result returned to the UI */
export interface SubmissionResult {
  reportId:  bigint
  proof:     ProofMetadata
  txHash:    string
  timestamp: number
}

/** Verification result returned to the UI */
export interface VerificationResult {
  reportId:    bigint
  verified:    boolean
  status:      StatusKey
  proof:       ProofMetadata
  privacyClaim: string
}

// ── Module 2: Confidential Volunteer Verification Types ───────────────────────

/** Private fields entered by volunteer (held strictly in local witness memory) */
export interface VolunteerCredentialInput {
  name:              string   // Private witness: legal name
  volunteerId:       string   // Private witness: volunteer ID
  address:           string   // Private witness: residential address
  certificateNumber: string   // Private witness: certification / license number
  contactInfo:       string   // Private witness: phone / email
  expirationDate:    string   // ISO date string -> parsed to unix timestamp for private witness
  organization:      string   // Issuing agency / squad
  role:              string   // Assigned role / badge
}

/** Mirrors on-chain VolunteerAttestation struct */
export interface OnChainVolunteerAttestation {
  commitment: string
  attestedAt: number
  isVerified: boolean         // Selective disclosure: Verified / Not Verified
  isActive:   boolean         // Selective disclosure: Certification Active / Expired
}

/** Discrete allowed return states for the confidential credential verification module */
export type ConfidentialCredentialStatus = 'VERIFIED' | 'NOT VERIFIED' | 'ACTIVE' | 'EXPIRED'

export const CONFIDENTIAL_STATUS_CODES: Record<number, ConfidentialCredentialStatus> = {
  0: 'NOT VERIFIED',
  1: 'VERIFIED',
  2: 'ACTIVE',
  3: 'EXPIRED',
}

/** Mirrors on-chain VolunteerCredentialRecord struct */
export interface VolunteerCredentialRecord {
  credentialId:       bigint
  verificationStatus: ConfidentialCredentialStatus
  statusCode:         number
  timestamp:          number
}

/** Full verification result returned to the UI */
export interface VolunteerVerificationResult {
  commitment:          string
  isVerified:          boolean
  isActive:            boolean
  status:              ConfidentialCredentialStatus
  attestedAt:          number
  proof:               ProofMetadata
  selectiveDisclosure: {
    revealed: {
      verificationStatus: 'VERIFIED' | 'NOT VERIFIED'
      certificationState: 'ACTIVE' | 'EXPIRED'
    }
    hiddenPrivateFields: string[]
  }
}

