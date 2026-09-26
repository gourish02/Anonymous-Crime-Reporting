// =============================================================================
// SafeCity — Midnight Blockchain Test Suite
//
// Tests Midnight Compact circuits, witness isolation, and selective disclosure:
//   Test 1: Crime report submission succeeds
//   Test 2: Crime report verification succeeds
//   Test 3: Valid volunteer credential verifies
//   Test 4: Expired credential fails verification
//   Test 5: Private identity information remains hidden
// =============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  submitCrimeReport,
  verifyReport,
  getReportStatus,
  generateMockReports,
} from '@/api/midnight'
import {
  submitVolunteerCredential,
  verifyVolunteerCredential,
  getVerificationStatus,
  proveVolunteerEligibility,
  computeCredentialCommitment,
  VOLUNTEER_PRESETS,
} from '@/api/volunteer'
import {
  submitAgeCredential,
  verifyAgeEligibility,
  getEligibilityStatus as getAgeEligibilityStatus,
  calculateAge,
  computeAgeCommitment,
  AGE_PRESETS,
} from '@/api/ageVerification'
import type {
  ReportFormData,
  VolunteerCredentialInput,
  ConfidentialCredentialStatus,
  AgeCredentialInput,
  AgeEligibilityStatus,
} from '@/types'

// ── In-Memory Storage Polyfill for Vitest / Node Environment ─────────────────

const storageStore = new Map<string, string>()
const mockLocalStorage = {
  getItem: (key: string) => storageStore.get(key) ?? null,
  setItem: (key: string, value: string) => storageStore.set(key, String(value)),
  removeItem: (key: string) => storageStore.delete(key),
  clear: () => storageStore.clear(),
  get length() { return storageStore.size },
  key: (i: number) => Array.from(storageStore.keys())[i] ?? null,
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: mockLocalStorage,
      crypto: globalThis.crypto,
      midnight: undefined,
    },
    writable: true,
  })
} else {
  if (!globalThis.window.localStorage) {
    Object.assign(globalThis.window, { localStorage: mockLocalStorage })
  }
}

// =============================================================================
// MIDNIGHT COMPACT CONTRACT SIMULATOR
// Directly models state transitions and circuit constraints from:
// contract/src/crime_report.compact
// =============================================================================

interface CompactPublicReport {
  report_id: bigint
  crime_type: number
  timestamp: bigint
  verification_status: number // 0=Pending, 1=Verified
  verified: boolean
  upvotes: number
  has_evidence: boolean
}

interface CompactVolunteerCredentialRecord {
  credential_id: bigint
  verification_status: number // 0=NOT VERIFIED, 1=VERIFIED, 2=ACTIVE, 3=EXPIRED
  timestamp: bigint
}

interface CompactVolunteerAttestation {
  commitment: string
  attested_at: bigint
  is_verified: boolean
  is_active: boolean
}

class MidnightCompactContractSimulator {
  // Public Ledger State (Mirrors contract/src/crime_report.compact export ledger)
  public report_count: bigint = 0n
  public verified_count: bigint = 0n
  public volunteer_count: bigint = 0n
  public active_volunteers_count: bigint = 0n
  public public_reports = new Map<bigint, CompactPublicReport>()
  public volunteer_credentials = new Map<bigint, CompactVolunteerCredentialRecord>()
  public volunteer_attestations = new Map<string, CompactVolunteerAttestation>()

  // ── Circuit 1: submitCrimeReport ───────────────────────────────────────────
  // Evaluates private witnesses: reporterIdentity, crimeDescription, evidenceHash
  // Emits public ledger report with zero PII
  submitCrimeReport(
    _privateWitness: {
      reporterIdentity: string
      crimeDescription: string
      evidenceHash: string
    },
    publicInputs: {
      crime_type: number
      date_timestamp: bigint
      has_evidence: boolean
    }
  ): { reportId: bigint; txHash: string; verifiedOnChain: boolean } {
    this.report_count += 1n
    const reportId = this.report_count

    const report: CompactPublicReport = {
      report_id: reportId,
      crime_type: publicInputs.crime_type,
      timestamp: publicInputs.date_timestamp,
      verification_status: 0, // Pending
      verified: false,
      upvotes: 0,
      has_evidence: publicInputs.has_evidence,
    }

    this.public_reports.set(reportId, report)
    return {
      reportId,
      txHash: `0x_midnight_tx_${reportId.toString()}`,
      verifiedOnChain: true,
    }
  }

  // ── Circuit 2: verifyReport ────────────────────────────────────────────────
  // Verifies an existing report by reportId without revealing reporter
  verifyReport(reportId: bigint): { verified: boolean; status: number } {
    const report = this.public_reports.get(reportId)
    if (!report) throw new Error(`Report ${reportId} not found`)

    report.verification_status = 1 // Verified
    report.verified = true
    this.verified_count += 1n

    return {
      verified: true,
      status: 1,
    }
  }

  // ── Circuit 3: submitVolunteerCredential ───────────────────────────────────
  // Evaluates 7 private witnesses: volunteerName, volunteerId, credentialHash,
  // certificateNumber, address, phoneNumber, expiryDate
  submitVolunteerCredential(
    privateWitness: {
      volunteerName: string
      volunteerId: string
      credentialHash: string
      certificateNumber: string
      address: string
      phoneNumber: string
      expiryDate: bigint
    },
    currentTime: bigint
  ): { credentialId: bigint; status: ConfidentialCredentialStatus; statusCode: number } {
    this.volunteer_count += 1n
    const credentialId = this.volunteer_count
    const isExpired = privateWitness.expiryDate < currentTime

    const status: ConfidentialCredentialStatus = isExpired ? 'EXPIRED' : 'VERIFIED'
    const statusCode = isExpired ? 3 : 1

    if (!isExpired) {
      this.active_volunteers_count += 1n
    }

    this.volunteer_credentials.set(credentialId, {
      credential_id: credentialId,
      verification_status: statusCode,
      timestamp: currentTime,
    })

    return {
      credentialId,
      status,
      statusCode,
    }
  }

  // ── Circuit 4: verifyVolunteerCredential ───────────────────────────────────
  // Checks expiryDate >= currentTime inside circuit; emits only discrete status
  verifyVolunteerCredential(
    credentialId: bigint,
    currentTime: bigint
  ): { status: ConfidentialCredentialStatus; statusCode: number; isVerified: boolean; isActive: boolean } {
    const record = this.volunteer_credentials.get(credentialId)
    if (!record) {
      return {
        status: 'NOT VERIFIED',
        statusCode: 0,
        isVerified: false,
        isActive: false,
      }
    }

    if (record.verification_status === 3) {
      return {
        status: 'EXPIRED',
        statusCode: 3,
        isVerified: true,
        isActive: false,
      }
    }

    return {
      status: 'ACTIVE',
      statusCode: 2,
      isVerified: true,
      isActive: true,
    }
  }
}

// =============================================================================
// COMPLETE TEST SUITE (MINIMUM 5 REQUIRED TESTS)
// =============================================================================

describe('SafeCity — Midnight Blockchain Test Suite', () => {
  let simulator: MidnightCompactContractSimulator

  beforeEach(() => {
    storageStore.clear()
    simulator = new MidnightCompactContractSimulator()
  })

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: Crime report submission succeeds
  // ───────────────────────────────────────────────────────────────────────────
  it('1. Crime report submission succeeds', async () => {
    // 1.1 Test using Midnight Compact contract simulator
    const privateWitness = {
      reporterIdentity: 'witness_secp256k1_salt_9941a8b',
      crimeDescription: 'Bicycle theft reported outside Metro station bike rack',
      evidenceHash: '0x8f2d5a7b1c4e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
    }

    const publicInputs = {
      crime_type: 1, // Theft
      date_timestamp: BigInt(Date.now()),
      has_evidence: true,
    }

    const simResult = simulator.submitCrimeReport(privateWitness, publicInputs)
    expect(simResult.reportId).toBeGreaterThan(0n)
    expect(simResult.verifiedOnChain).toBe(true)
    expect(simulator.report_count).toBe(1n)

    const storedReport = simulator.public_reports.get(simResult.reportId)
    expect(storedReport).toBeDefined()
    expect(storedReport?.crime_type).toBe(1)
    expect(storedReport?.verification_status).toBe(0) // Pending
    expect(storedReport?.verified).toBe(false)
    expect(storedReport?.has_evidence).toBe(true)

    // 1.2 Test using frontend Midnight SDK API layer
    const formData: ReportFormData = {
      crimeType: 1,
      location: 'Metro Station Bike Rack, Sector 4',
      date: '2026-09-25',
      description: 'Confidential whistleblower report of bicycle theft',
      evidenceHash: '0x8f2d5a7b1c4e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
    }

    const apiResult = await submitCrimeReport(formData, 'preprod')
    expect(apiResult).toBeDefined()
    expect(apiResult.reportId).toBeGreaterThan(0n)
    expect(apiResult.proof).toBeDefined()
    expect(apiResult.proof.circuitName).toBe('submitCrimeReport')
    expect(apiResult.proof.verifiedOnChain).toBe(true)
    expect(apiResult.txHash).toMatch(/^tx_/)
  }, 15000)

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: Crime report verification succeeds
  // ───────────────────────────────────────────────────────────────────────────
  it('2. Crime report verification succeeds', async () => {
    // 2.1 Submit report on simulator first
    const submission = simulator.submitCrimeReport(
      {
        reporterIdentity: 'witness_secp256k1_salt_7712',
        crimeDescription: 'Cyber fraud phishing attack',
        evidenceHash: '0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
      },
      {
        crime_type: 3, // Cyber Crime
        date_timestamp: BigInt(Date.now() - 3600000),
        has_evidence: true,
      }
    )

    // Verify report via circuit
    const verifySim = simulator.verifyReport(submission.reportId)
    expect(verifySim.verified).toBe(true)
    expect(verifySim.status).toBe(1) // Verified

    const onChainReport = simulator.public_reports.get(submission.reportId)
    expect(onChainReport?.verified).toBe(true)
    expect(onChainReport?.verification_status).toBe(1)
    expect(simulator.verified_count).toBe(1n)

    // 2.2 Test using frontend Midnight SDK API layer
    const apiVerify = await verifyReport(submission.reportId, 'preprod')
    expect(apiVerify.reportId).toBe(submission.reportId)
    expect(apiVerify.verified).toBe(true)
    expect(apiVerify.proof.circuitName).toBe('verifyReport')
    expect(apiVerify.proof.verifiedOnChain).toBe(true)
    expect(apiVerify.privacyClaim).toBe('Report verified without revealing reporter identity')

    // 2.3 Verify status inquiry circuit
    const status = await getReportStatus(submission.reportId, 'preprod')
    expect(status).toBe(1)
  }, 15000)

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: Valid volunteer credential verifies
  // ───────────────────────────────────────────────────────────────────────────
  it('3. Valid volunteer credential verifies', async () => {
    const validPreset = VOLUNTEER_PRESETS[0] // Sarah Jenkins, Active First Responder
    const futureDate = new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]

    const validCredInput: VolunteerCredentialInput = {
      name: validPreset.name,
      volunteerId: validPreset.volunteerId,
      address: validPreset.address,
      certificateNumber: validPreset.certificateNumber,
      contactInfo: validPreset.contactInfo,
      expirationDate: futureDate,
      organization: validPreset.organization,
      role: validPreset.role,
    }

    // 3.1 Test in Midnight simulator
    const simSubmit = simulator.submitVolunteerCredential(
      {
        volunteerName: validCredInput.name,
        volunteerId: validCredInput.volunteerId,
        credentialHash: '0xhash_medic_valid',
        certificateNumber: validCredInput.certificateNumber,
        address: validCredInput.address,
        phoneNumber: validCredInput.contactInfo,
        expiryDate: BigInt(Date.now() + 86400000 * 365),
      },
      BigInt(Date.now())
    )

    expect(simSubmit.status).toBe('VERIFIED')
    expect(simSubmit.statusCode).toBe(1)

    const simVerify = simulator.verifyVolunteerCredential(simSubmit.credentialId, BigInt(Date.now()))
    expect(simVerify.status).toBe('ACTIVE')
    expect(simVerify.statusCode).toBe(2)
    expect(simVerify.isVerified).toBe(true)
    expect(simVerify.isActive).toBe(true)

    // 3.2 Test via Module 2 API (submitVolunteerCredential + verifyVolunteerCredential)
    const apiSubmit = await submitVolunteerCredential(validCredInput)
    expect(apiSubmit.credentialId).toBeGreaterThan(0n)
    expect(apiSubmit.status).toBe('VERIFIED')
    expect(apiSubmit.proof.circuitName).toBe('submitVolunteerCredential')
    expect(apiSubmit.proof.verifiedOnChain).toBe(true)

    const apiVerify = await verifyVolunteerCredential(apiSubmit.credentialId)
    expect(apiVerify.status).toBe('ACTIVE')
    expect(apiVerify.statusCode).toBe(2)
    expect(apiVerify.isVerified).toBe(true)
    expect(apiVerify.isActive).toBe(true)
    expect(apiVerify.proof.circuitName).toBe('verifyVolunteerCredential')

    // 3.3 Test Selective Disclosure Prover (proveVolunteerEligibility)
    const proverResult = await proveVolunteerEligibility(validCredInput)
    expect(proverResult.isVerified).toBe(true)
    expect(proverResult.isActive).toBe(true)
    expect(proverResult.status).toBe('ACTIVE')
    expect(proverResult.commitment).toMatch(/^0x[a-f0-9]{64}$/)
  }, 15000)

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 4: Expired credential fails verification
  // ───────────────────────────────────────────────────────────────────────────
  it('4. Expired credential fails verification', async () => {
    const expiredPreset = VOLUNTEER_PRESETS[2] // Marcus Vance, Expired Patrol
    const pastDate = '2023-01-15'

    const expiredCredInput: VolunteerCredentialInput = {
      name: expiredPreset.name,
      volunteerId: expiredPreset.volunteerId,
      address: expiredPreset.address,
      certificateNumber: expiredPreset.certificateNumber,
      contactInfo: expiredPreset.contactInfo,
      expirationDate: pastDate,
      organization: expiredPreset.organization,
      role: expiredPreset.role,
    }

    // 4.1 Test in Midnight simulator
    const currentTime = BigInt(Date.now())
    const pastTimestamp = BigInt(new Date(pastDate).getTime())

    const simSubmit = simulator.submitVolunteerCredential(
      {
        volunteerName: expiredCredInput.name,
        volunteerId: expiredCredInput.volunteerId,
        credentialHash: '0xhash_expired_patrol',
        certificateNumber: expiredCredInput.certificateNumber,
        address: expiredCredInput.address,
        phoneNumber: expiredCredInput.contactInfo,
        expiryDate: pastTimestamp,
      },
      currentTime
    )

    expect(simSubmit.status).toBe('EXPIRED')
    expect(simSubmit.statusCode).toBe(3)

    const simVerify = simulator.verifyVolunteerCredential(simSubmit.credentialId, currentTime)
    expect(simVerify.status).toBe('EXPIRED')
    expect(simVerify.statusCode).toBe(3)
    expect(simVerify.isActive).toBe(false) // Fails active certification test

    // 4.2 Test via Module 2 API
    const apiSubmit = await submitVolunteerCredential(expiredCredInput)
    expect(apiSubmit.status).toBe('EXPIRED')
    expect(apiSubmit.statusCode).toBe(3)

    const apiVerify = await verifyVolunteerCredential(apiSubmit.credentialId)
    expect(apiVerify.status).toBe('EXPIRED')
    expect(apiVerify.statusCode).toBe(3)
    expect(apiVerify.isActive).toBe(false)

    // 4.3 Test unregistered credential ID fails verification
    const unknownId = 999999n
    const unknownVerify = await verifyVolunteerCredential(unknownId)
    expect(unknownVerify.status).toBe('NOT VERIFIED')
    expect(unknownVerify.statusCode).toBe(0)
    expect(unknownVerify.isVerified).toBe(false)
    expect(unknownVerify.isActive).toBe(false)

    // 4.4 Test read-only getVerificationStatus circuit
    const status = await getVerificationStatus(apiSubmit.credentialId)
    expect(status).toBe('EXPIRED')
  }, 15000)

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5: Private identity information remains hidden
  // ───────────────────────────────────────────────────────────────────────────
  it('5. Private identity information remains hidden', async () => {
    // Sensitive Private Witnesses
    const privateReporterIdentity = 'whistleblower_alice_wallet_address_0x994829'
    const privateCrimeDescription = 'Sensitive confidential crime incident narrative at 123 Main St'
    const privateVolunteerName = 'Dr. Alexander Montgomery'
    const privateVolunteerId = 'VOL-MEDIC-SECRET-99410'
    const privateAddress = '404 Hidden Sanctum Way, Private District, Metropolis'
    const privateCertNumber = 'CERT-TOP-SECRET-007'
    const privatePhoneNumber = '+1 (800) 555-PRIVACY'
    const privateExpiryDate = '2029-12-31'

    // 5.1 Execute Crime Report circuit
    simulator.submitCrimeReport(
      {
        reporterIdentity: privateReporterIdentity,
        crimeDescription: privateCrimeDescription,
        evidenceHash: '0xhash_evidence',
      },
      {
        crime_type: 2, // Assault
        date_timestamp: BigInt(Date.now()),
        has_evidence: true,
      }
    )

    // Inspect Public Reports Map on Ledger
    for (const [, report] of simulator.public_reports) {
      const publicSerialized = JSON.stringify(report, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
      expect(publicSerialized).not.toContain(privateReporterIdentity)
      expect(publicSerialized).not.toContain(privateCrimeDescription)
      expect(publicSerialized).not.toContain('Main St')
      expect(publicSerialized).not.toContain('alice')
    }

    // 5.2 Execute Volunteer Credential circuit
    const volInput: VolunteerCredentialInput = {
      name: privateVolunteerName,
      volunteerId: privateVolunteerId,
      address: privateAddress,
      certificateNumber: privateCertNumber,
      contactInfo: privatePhoneNumber,
      expirationDate: privateExpiryDate,
      organization: 'Emergency Response Taskforce',
      role: 'Chief Medical Officer',
    }

    const commitment = await computeCredentialCommitment(volInput)
    const submitResult = await submitVolunteerCredential(volInput)

    // Inspect Simulator Volunteer Ledger
    simulator.submitVolunteerCredential(
      {
        volunteerName: privateVolunteerName,
        volunteerId: privateVolunteerId,
        credentialHash: commitment,
        certificateNumber: privateCertNumber,
        address: privateAddress,
        phoneNumber: privatePhoneNumber,
        expiryDate: BigInt(new Date(privateExpiryDate).getTime()),
      },
      BigInt(Date.now())
    )

    for (const [, record] of simulator.volunteer_credentials) {
      const recordSerialized = JSON.stringify(record, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
      expect(recordSerialized).not.toContain(privateVolunteerName)
      expect(recordSerialized).not.toContain(privateVolunteerId)
      expect(recordSerialized).not.toContain(privateAddress)
      expect(recordSerialized).not.toContain(privateCertNumber)
      expect(recordSerialized).not.toContain(privatePhoneNumber)
    }

    // Inspect API result and proof metadata
    const apiResultSerialized = JSON.stringify(submitResult, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
    expect(apiResultSerialized).not.toContain(privateVolunteerName)
    expect(apiResultSerialized).not.toContain(privateVolunteerId)
    expect(apiResultSerialized).not.toContain(privateAddress)
    expect(apiResultSerialized).not.toContain(privateCertNumber)
    expect(apiResultSerialized).not.toContain(privatePhoneNumber)

    // The commitment must be a cryptographically irreversible 32-byte digest
    expect(submitResult.commitment).toMatch(/^0x[a-f0-9]{64}$/)
    expect(submitResult.commitment).not.toContain(privateVolunteerName)
    expect(submitResult.commitment).not.toContain(privateVolunteerId)

    // Public return status is strictly one of the 4 permitted discrete values
    const allowedStatuses: ConfidentialCredentialStatus[] = ['VERIFIED', 'NOT VERIFIED', 'ACTIVE', 'EXPIRED']
    expect(allowedStatuses).toContain(submitResult.status)
  }, 15000)

  // ───────────────────────────────────────────────────────────────────────────
  // ADDITIONAL TEST 6: Selective disclosure commitment integrity
  // ───────────────────────────────────────────────────────────────────────────
  it('6. Selective disclosure commitment integrity and collision resistance', async () => {
    const credA: VolunteerCredentialInput = {
      name: 'Agent A',
      volunteerId: 'ID-001',
      address: 'Station A',
      certificateNumber: 'CERT-001',
      contactInfo: 'a@safecity.org',
      expirationDate: '2028-01-01',
      organization: 'Unit A',
      role: 'Scout',
    }

    const credB: VolunteerCredentialInput = {
      ...credA,
      volunteerId: 'ID-002', // Single character alteration
    }

    const hashA = await computeCredentialCommitment(credA)
    const hashB = await computeCredentialCommitment(credB)

    // Strict avalanche & collision resistance
    expect(hashA).not.toBe(hashB)
    expect(hashA.length).toBe(66) // '0x' + 64 hex chars
    expect(hashB.length).toBe(66)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // MODULE 3: AGE ELIGIBILITY VERIFICATION TESTS
  // ───────────────────────────────────────────────────────────────────────────

  // Test 7: Age >= 18 passes eligibility verification
  it('7. Age >= 18 passes eligibility verification (ELIGIBLE)', async () => {
    const adultInput: AgeCredentialInput = {
      fullName: 'Marcus Aurelius',
      dateOfBirth: '1995-03-15', // 30+ years old
      governmentId: 'GOV-DL-992144',
      identitySalt: '0x' + 'aa'.repeat(32),
    }

    const calculatedAge = calculateAge(adultInput.dateOfBirth)
    expect(calculatedAge).toBeGreaterThanOrEqual(18)

    const result = await submitAgeCredential(adultInput, 'preprod')
    expect(result.status).toBe('ELIGIBLE')
    expect(result.isEligible).toBe(true)
    expect(result.statusCode).toBe(1)
    expect(result.credentialId).toBeGreaterThan(0n)
    expect(result.proof.circuitName).toBe('submitAgeCredential')
    expect(result.proof.verifiedOnChain).toBe(true)

    // Verify read-only status query circuit
    const status = await getAgeEligibilityStatus(result.credentialId)
    expect(status).toBe('ELIGIBLE')

    // Verify re-evaluation circuit
    const reVerification = await verifyAgeEligibility(result.credentialId, adultInput)
    expect(reVerification.status).toBe('ELIGIBLE')
    expect(reVerification.isEligible).toBe(true)
  })

  // Test 8: Age < 18 fails eligibility verification
  it('8. Age < 18 fails eligibility verification (NOT ELIGIBLE)', async () => {
    const minorInput: AgeCredentialInput = {
      fullName: 'Tommy Minor',
      dateOfBirth: '2010-06-20', // ~16 years old
      governmentId: 'ST-ID-2023-8812',
      identitySalt: '0x' + 'bb'.repeat(32),
    }

    const calculatedAge = calculateAge(minorInput.dateOfBirth)
    expect(calculatedAge).toBeLessThan(18)

    const result = await submitAgeCredential(minorInput, 'preprod')
    expect(result.status).toBe('NOT ELIGIBLE')
    expect(result.isEligible).toBe(false)
    expect(result.statusCode).toBe(0)

    const status = await getAgeEligibilityStatus(result.credentialId)
    expect(status).toBe('NOT ELIGIBLE')

    // Unknown ID returns NOT ELIGIBLE
    const unknownStatus = await getAgeEligibilityStatus(999999n)
    expect(unknownStatus).toBe('NOT ELIGIBLE')
  })

  // Test 9: Actual age, date of birth, and identity remain strictly private
  it('9. Actual age, date of birth, and personal identity remain strictly private', async () => {
    const privateAgeNumber = 29
    const privateDOB = '1997-12-04'
    const privateGovId = 'CONFIDENTIAL_PASSPORT_887711'
    const privateFullName = 'Agent Cassandra Fox'
    const privateSalt = '0xSECRET_SALT_VALUE_12345'

    const confidentialInput: AgeCredentialInput = {
      fullName: privateFullName,
      dateOfBirth: privateDOB,
      governmentId: privateGovId,
      identitySalt: privateSalt,
    }

    const result = await submitAgeCredential(confidentialInput, 'preprod')

    // Inspect the return structure
    const serialized = JSON.stringify(result, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
    expect(serialized).not.toContain(privateFullName)
    expect(serialized).not.toContain(privateDOB)
    expect(serialized).not.toContain(privateGovId)
    expect(serialized).not.toMatch(/"actualAge"\s*:/)
    expect(serialized).not.toMatch(/"userAge"\s*:/)
    expect(serialized).not.toMatch(/"age"\s*:/)
    expect(result).not.toHaveProperty('actualAge')
    expect(result).not.toHaveProperty('userAge')
    expect(result).not.toHaveProperty('age')

    // Check selective disclosure contract
    expect(result.selectiveDisclosure.revealed.eligibilityStatus).toBe('ELIGIBLE')
    expect(result.selectiveDisclosure.hiddenPrivateFields).toContain('actualAge')
    expect(result.selectiveDisclosure.hiddenPrivateFields).toContain('dateOfBirth')
    expect(result.selectiveDisclosure.hiddenPrivateFields).toContain('governmentId')

    // Check commitment hash integrity
    const commitment = await computeAgeCommitment(confidentialInput)
    expect(commitment).toMatch(/^0x[a-f0-9]{64}$/)
    expect(commitment).not.toContain(privateFullName)
    expect(commitment).not.toContain(privateDOB)
  })
})

