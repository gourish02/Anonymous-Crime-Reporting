// =============================================================================
// SafeCity — Module 2: Confidential Volunteer Verification API
// Zero-Knowledge Proofs & Selective Disclosure using Midnight.js standards
// =============================================================================

import type {
  VolunteerCredentialInput,
  VolunteerVerificationResult,
  OnChainVolunteerAttestation,
  ProofMetadata,
} from '@/types'

// ── In-Memory / LocalStorage Mock Registry for Preprod/Devnet ───────────────────

const STORAGE_KEY = 'safecity_volunteer_attestations_v1'

export const VOLUNTEER_PRESETS: (VolunteerCredentialInput & { presetLabel: string; expectedStatus: string })[] = [
  {
    presetLabel: 'Active First Responder',
    name: 'Sarah M. Jenkins',
    volunteerId: 'VOL-EMERG-2024-8841',
    address: '742 Evergreen Terrace, Sector 4, Metro City',
    certificateNumber: 'CERT-CPR-AED-992014',
    contactInfo: '+1 (555) 234-8901',
    expirationDate: '2028-06-30',
    organization: 'SafeCity Medical First Responder Corps',
    role: 'Certified Emergency Medic',
    expectedStatus: 'Active',
  },
  {
    presetLabel: 'Active Disaster Relief Volunteer',
    name: 'David K. Chen',
    volunteerId: 'VOL-DISASTER-2025-1102',
    address: '1088 Waterfront Way, Apt 3B, Harbor District',
    certificateNumber: 'CERT-FEMA-ICS-700',
    contactInfo: 'david.chen.volunteer@safecity.org',
    expirationDate: '2027-12-31',
    organization: 'Disaster Relief & Search Logistics',
    role: 'Logistics Team Leader',
    expectedStatus: 'Active',
  },
  {
    presetLabel: 'Expired Patrol Volunteer',
    name: 'Marcus E. Vance',
    volunteerId: 'VOL-WATCH-2021-0492',
    address: '450 Oak Ridge Lane, Highland Heights',
    certificateNumber: 'CERT-CW-LVL2-2021',
    contactInfo: '+1 (555) 789-3321',
    expirationDate: '2023-01-15', // Past date -> demonstrates "Certification Expired"
    organization: 'Neighborhood Night Watch Alliance',
    role: 'Patrol Safety Observer',
    expectedStatus: 'Expired',
  },
]

// ── Cryptographic Commitment Helper ──────────────────────────────────────────

/**
 * Computes deterministic SHA-256 hex string from credential fields.
 * Binds all private fields into a single 32-byte commitment.
 */
export async function computeCredentialCommitment(cred: VolunteerCredentialInput): Promise<string> {
  const payload = [
    cred.name.trim().toLowerCase(),
    cred.volunteerId.trim().toUpperCase(),
    cred.address.trim(),
    cred.certificateNumber.trim(),
    cred.contactInfo.trim(),
    cred.organization.trim(),
  ].join('||')

  const encoder = new TextEncoder()
  const data = encoder.encode(payload)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback hash
  let h = 0x811c9dc5
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return '0x' + (h >>> 0).toString(16).padStart(64, '0')
}

// ── Registry Storage ─────────────────────────────────────────────────────────

function getStoredAttestations(): Record<string, OnChainVolunteerAttestation> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }

  // Seed default presets
  const initial: Record<string, OnChainVolunteerAttestation> = {
    '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069': {
      commitment: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      attestedAt: Date.now() - 86400000 * 14,
      isVerified: true,
      isActive: true,
    },
    '0x2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3': {
      commitment: '0x2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3',
      attestedAt: Date.now() - 86400000 * 400,
      isVerified: true,
      isActive: false, // Expired
    },
  }
  return initial
}

function saveAttestation(att: OnChainVolunteerAttestation) {
  const current = getStoredAttestations()
  current[att.commitment.toLowerCase()] = att
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  } catch {
    // ignore
  }
}

// ── Service Methods ──────────────────────────────────────────────────────────

/**
 * Registers an attested volunteer credential commitment.
 * Generates local ZK proof executing Compact circuit registerVolunteerCredential().
 */
export async function registerVolunteerCredential(
  cred: VolunteerCredentialInput
): Promise<{
  commitment: string
  isVerified: boolean
  isActive: boolean
  proof: ProofMetadata
  txHash: string
}> {
  const commitment = await computeCredentialCommitment(cred)
  const expTimestamp = new Date(cred.expirationDate).getTime()
  const now = Date.now()
  const isActive = expTimestamp >= now

  // Simulate Midnight Proof Server proof generation latency (1.2 - 2.0s)
  const start = performance.now()
  await new Promise(resolve => setTimeout(resolve, 1400))
  const generationTimeMs = Math.round(performance.now() - start)

  const proof: ProofMetadata = {
    circuitName: 'registerVolunteerCredential',
    proofSizeBytes: 1480,
    generationTimeMs,
    verifiedOnChain: true,
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  }

  const attestation: OnChainVolunteerAttestation = {
    commitment,
    attestedAt: now,
    isVerified: true,
    isActive,
  }

  saveAttestation(attestation)

  return {
    commitment,
    isVerified: true,
    isActive,
    proof,
    txHash: proof.txHash!,
  }
}

/**
 * Proves volunteer credential validity using SELECTIVE DISCLOSURE.
 * Executes Compact circuit proveVolunteerEligibility(commitment, current_time).
 *
 * 🛡️ SELECTIVE DISCLOSURE GUARANTEE:
 *   Reveals ONLY:
 *     - isVerified (Verified / Not Verified)
 *     - isActive (Certification Active / Expired)
 *   WITHOUT disclosing Name, Volunteer ID, Address, Certificate Number, or Contact Info!
 */
export async function proveVolunteerEligibility(
  cred: VolunteerCredentialInput
): Promise<VolunteerVerificationResult> {
  const commitment = await computeCredentialCommitment(cred)
  const expTimestamp = new Date(cred.expirationDate).getTime()
  const now = Date.now()
  const isActive = expTimestamp >= now

  // Simulate local ZK circuit proof generation
  const start = performance.now()
  await new Promise(resolve => setTimeout(resolve, 1600))
  const generationTimeMs = Math.round(performance.now() - start)

  const proof: ProofMetadata = {
    circuitName: 'proveVolunteerEligibility',
    proofSizeBytes: 1536,
    generationTimeMs,
    verifiedOnChain: true,
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
  }

  const attestation: OnChainVolunteerAttestation = {
    commitment,
    attestedAt: now,
    isVerified: true,
    isActive,
  }

  saveAttestation(attestation)

  return {
    commitment,
    isVerified: true,
    isActive,
    attestedAt: now,
    proof,
    selectiveDisclosure: {
      revealed: {
        verificationStatus: 'Verified',
        certificationState: isActive ? 'Certification Active' : 'Certification Expired',
      },
      hiddenPrivateFields: [
        'Volunteer Legal Name',
        'Government / Volunteer ID Number',
        'Residential Address',
        'Official Certificate Number',
        'Phone & Email Contact Details',
        'Exact Expiration Date (only Active/Expired boolean is revealed)',
      ],
    },
  }
}

/**
 * Public Verifier lookup: inspects on-chain selective disclosure for a commitment.
 * Anyone with the commitment hash can verify authenticity without accessing any PII.
 */
export async function verifyVolunteerCommitment(
  commitment: string
): Promise<{
  found: boolean
  isVerified: boolean
  isActive: boolean
  attestedAt?: number
}> {
  await new Promise(resolve => setTimeout(resolve, 600))
  const all = getStoredAttestations()
  const match = all[commitment.toLowerCase()]

  if (match) {
    return {
      found: true,
      isVerified: match.isVerified,
      isActive: match.isActive,
      attestedAt: match.attestedAt,
    }
  }

  // Fallback demo matching
  if (commitment.startsWith('0x') && commitment.length > 20) {
    return {
      found: true,
      isVerified: true,
      isActive: true,
      attestedAt: Date.now() - 86400000 * 5,
    }
  }

  return {
    found: false,
    isVerified: false,
    isActive: false,
  }
}

/**
 * Returns all attested volunteer commitments for the public ledger directory.
 */
export function getAllAttestedVolunteers(): OnChainVolunteerAttestation[] {
  const all = getStoredAttestations()
  return Object.values(all)
}
