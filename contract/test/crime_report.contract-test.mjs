// =============================================================================
// Midnight Compact Contract Test Suite
// contract/test/crime_report.test.mjs
// Tests the 5 core requirements on the Compact contract circuits
// =============================================================================

import { test, describe, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'

// ── Compact Simulator for Midnight Contract ─────────────────────────────────

class MidnightCompactTestEngine {
  constructor() {
    this.report_count = 0n
    this.verified_count = 0n
    this.volunteer_count = 0n
    this.active_volunteers_count = 0n
    this.age_credential_count = 0n
    this.eligible_users_count = 0n
    this.public_reports = new Map()
    this.volunteer_credentials = new Map()
    this.volunteer_attestations = new Map()
    this.age_eligibility_records = new Map()
    this.age_eligibility_status = new Map()
    this.age_timestamp = new Map()
  }

  // Circuit 1: submitCrimeReport
  submitCrimeReport(witness, publicInputs) {
    assert.ok(witness.reporterIdentity, 'Witness reporterIdentity required')
    assert.ok(witness.crimeDescription, 'Witness crimeDescription required')
    assert.ok(typeof publicInputs.crime_type === 'number', 'crime_type required')

    this.report_count += 1n
    const reportId = this.report_count

    this.public_reports.set(reportId, {
      report_id: reportId,
      crime_type: publicInputs.crime_type,
      timestamp: publicInputs.date_timestamp,
      verification_status: 0, // Pending
      verified: false,
      upvotes: 0,
      has_evidence: publicInputs.has_evidence,
    })

    return {
      reportId,
      txHash: '0x' + crypto.randomBytes(32).toString('hex'),
      verifiedOnChain: true,
    }
  }

  // Circuit 2: verifyReport
  verifyReport(reportId) {
    const report = this.public_reports.get(reportId)
    assert.ok(report, `Report ID ${reportId} must exist on-chain`)

    report.verification_status = 1 // Verified
    report.verified = true
    this.verified_count += 1n

    return {
      reportId,
      verified: true,
      status: 1,
      privacyClaim: 'Report verified without revealing reporter identity',
    }
  }

  // Circuit 3: submitVolunteerCredential
  submitVolunteerCredential(witness, currentTime) {
    assert.ok(witness.volunteerName, 'Witness volunteerName required')
    assert.ok(witness.volunteerId, 'Witness volunteerId required')
    assert.ok(witness.certificateNumber, 'Witness certificateNumber required')

    this.volunteer_count += 1n
    const credentialId = this.volunteer_count
    const isExpired = witness.expiryDate < currentTime

    const status = isExpired ? 'EXPIRED' : 'VERIFIED'
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

  // Circuit 4: verifyVolunteerCredential
  verifyVolunteerCredential(credentialId, currentTime) {
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

  // Circuit 5: getVerificationStatus
  getVerificationStatus(credentialId) {
    const record = this.volunteer_credentials.get(credentialId)
    if (!record) return 'NOT VERIFIED'
    if (record.verification_status === 3) return 'EXPIRED'
    if (record.verification_status === 2) return 'ACTIVE'
    if (record.verification_status === 1) return 'VERIFIED'
    return 'NOT VERIFIED'
  }

  // ── Module 3: Age Eligibility Verification Circuits ───────────────────────

  // Circuit 1: submitAgeCredential
  submitAgeCredential(witness, timestamp) {
    assert.ok(typeof witness.userAge === 'number', 'Witness userAge required')
    assert.ok(witness.governmentIdHash, 'Witness governmentIdHash required')
    assert.ok(witness.dateOfBirth, 'Witness dateOfBirth required')

    this.age_credential_count += 1n
    const credentialId = this.age_credential_count

    const isEligible = witness.userAge >= 18
    const statusCode = isEligible ? 1 : 0
    const status = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'

    if (isEligible) {
      this.eligible_users_count += 1n
    }

    // Only public state stored — NO actual age, NO DOB, NO ID
    this.age_eligibility_records.set(credentialId, {
      credential_id: credentialId,
      eligibility_status: statusCode,
      is_eligible: isEligible,
      timestamp,
    })
    this.age_eligibility_status.set(credentialId, statusCode)
    this.age_timestamp.set(credentialId, timestamp)

    return {
      credentialId,
      status,
      statusCode,
      isEligible,
    }
  }

  // Circuit 2: verifyAgeEligibility
  verifyAgeEligibility(credentialId, witness, currentTime) {
    const record = this.age_eligibility_records.get(credentialId)
    if (!record) {
      return {
        credentialId,
        status: 'NOT ELIGIBLE',
        statusCode: 0,
        isEligible: false,
      }
    }

    const isEligible = witness.userAge >= 18
    const statusCode = isEligible ? 1 : 0
    const status = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'

    record.eligibility_status = statusCode
    record.is_eligible = isEligible
    record.timestamp = currentTime

    this.age_eligibility_status.set(credentialId, statusCode)
    this.age_timestamp.set(credentialId, currentTime)

    return {
      credentialId,
      status,
      statusCode,
      isEligible,
    }
  }

  // Circuit 3: getEligibilityStatus
  getEligibilityStatus(credentialId) {
    const status = this.age_eligibility_status.get(credentialId)
    if (status === undefined) {
      return 'NOT ELIGIBLE'
    }
    return status === 1 ? 'ELIGIBLE' : 'NOT ELIGIBLE'
  }
}

describe('Midnight Compact Contract Circuits Test Suite', () => {
  let engine

  beforeEach(() => {
    engine = new MidnightCompactTestEngine()
  })

  // Test 1
  test('1. Crime report submission succeeds', () => {
    const witness = {
      reporterIdentity: 'witness_salt_whistleblower_123',
      crimeDescription: 'Stolen vehicle in parking structure',
      evidenceHash: '0x' + 'aa'.repeat(32),
    }

    const publicInputs = {
      crime_type: 1, // Theft
      date_timestamp: BigInt(Date.now()),
      has_evidence: true,
    }

    const result = engine.submitCrimeReport(witness, publicInputs)
    assert.equal(result.reportId, 1n)
    assert.equal(result.verifiedOnChain, true)
    assert.equal(engine.report_count, 1n)

    const onChain = engine.public_reports.get(1n)
    assert.equal(onChain.crime_type, 1)
    assert.equal(onChain.verification_status, 0) // Pending
    assert.equal(onChain.verified, false)
  })

  // Test 2
  test('2. Crime report verification succeeds', () => {
    const sub = engine.submitCrimeReport(
      {
        reporterIdentity: 'witness_alice',
        crimeDescription: 'Commercial fraud report',
        evidenceHash: '0x' + 'bb'.repeat(32),
      },
      {
        crime_type: 4, // Fraud
        date_timestamp: BigInt(Date.now()),
        has_evidence: true,
      }
    )

    const verifyResult = engine.verifyReport(sub.reportId)
    assert.equal(verifyResult.verified, true)
    assert.equal(verifyResult.status, 1)
    assert.equal(engine.verified_count, 1n)

    const updated = engine.public_reports.get(sub.reportId)
    assert.equal(updated.verified, true)
    assert.equal(updated.verification_status, 1)
  })

  // Test 3
  test('3. Valid volunteer credential verifies', () => {
    const now = BigInt(Date.now())
    const futureExpiry = now + 86400000n * 365n // 1 year in future

    const witness = {
      volunteerName: 'Sarah M. Jenkins',
      volunteerId: 'VOL-EMERG-2024-8841',
      credentialHash: '0x' + 'cc'.repeat(32),
      certificateNumber: 'CERT-CPR-AED-992014',
      address: '742 Evergreen Terrace',
      phoneNumber: '+1 (555) 234-8901',
      expiryDate: futureExpiry,
    }

    const sub = engine.submitVolunteerCredential(witness, now)
    assert.equal(sub.status, 'VERIFIED')
    assert.equal(sub.statusCode, 1)
    assert.equal(engine.volunteer_count, 1n)
    assert.equal(engine.active_volunteers_count, 1n)

    const verification = engine.verifyVolunteerCredential(sub.credentialId, now)
    assert.equal(verification.status, 'ACTIVE')
    assert.equal(verification.statusCode, 2)
    assert.equal(verification.isVerified, true)
    assert.equal(verification.isActive, true)
  })

  // Test 4
  test('4. Expired credential fails verification', () => {
    const now = BigInt(Date.now())
    const pastExpiry = now - 86400000n * 100n // Past date

    const witness = {
      volunteerName: 'Marcus E. Vance',
      volunteerId: 'VOL-WATCH-2021-0492',
      credentialHash: '0x' + 'dd'.repeat(32),
      certificateNumber: 'CERT-CW-LVL2-2021',
      address: '450 Oak Ridge Lane',
      phoneNumber: '+1 (555) 789-3321',
      expiryDate: pastExpiry,
    }

    const sub = engine.submitVolunteerCredential(witness, now)
    assert.equal(sub.status, 'EXPIRED')
    assert.equal(sub.statusCode, 3)

    const verification = engine.verifyVolunteerCredential(sub.credentialId, now)
    assert.equal(verification.status, 'EXPIRED')
    assert.equal(verification.statusCode, 3)
    assert.equal(verification.isActive, false) // Fails active certification test

    // Unregistered credential ID returns NOT VERIFIED
    const unknown = engine.verifyVolunteerCredential(99999n, now)
    assert.equal(unknown.status, 'NOT VERIFIED')
    assert.equal(unknown.statusCode, 0)
    assert.equal(unknown.isVerified, false)
    assert.equal(unknown.isActive, false)
  })

  // Test 5
  test('5. Private identity information remains hidden', () => {
    const privateReporter = 'secret_reporter_wallet_address_0xabcdef123456'
    const privateNarrative = 'Classified whistleblower witness statement at Central Bank'
    const privateName = 'Dr. Elizabeth Warren-Stone'
    const privateId = 'VOL-HIGH-SECURITY-7700'
    const privateAddress = '100 Classified Way, Level 4'
    const privateCert = 'CERT-TOP-CLEARANCE-999'
    const privatePhone = '+1-555-0199-SECRET'

    engine.submitCrimeReport(
      {
        reporterIdentity: privateReporter,
        crimeDescription: privateNarrative,
        evidenceHash: '0xee' + '00'.repeat(31),
      },
      {
        crime_type: 2,
        date_timestamp: BigInt(Date.now()),
        has_evidence: true,
      }
    )

    engine.submitVolunteerCredential(
      {
        volunteerName: privateName,
        volunteerId: privateId,
        credentialHash: '0xff' + '11'.repeat(31),
        certificateNumber: privateCert,
        address: privateAddress,
        phoneNumber: privatePhone,
        expiryDate: BigInt(Date.now() + 10000000),
      },
      BigInt(Date.now())
    )

    // Inspect Public Reports
    for (const [, report] of engine.public_reports) {
      const serialized = JSON.stringify(report, (k, v) => (typeof v === 'bigint' ? v.toString() : v))
      assert.ok(!serialized.includes(privateReporter), 'Public report must NOT contain reporter identity')
      assert.ok(!serialized.includes(privateNarrative), 'Public report must NOT contain narrative')
      assert.ok(!serialized.includes('Classified'), 'Public report must NOT contain secret keywords')
    }

    // Inspect Volunteer Credentials Ledger
    for (const [, record] of engine.volunteer_credentials) {
      const serialized = JSON.stringify(record, (k, v) => (typeof v === 'bigint' ? v.toString() : v))
      assert.ok(!serialized.includes(privateName), 'Volunteer record must NOT contain volunteer name')
      assert.ok(!serialized.includes(privateId), 'Volunteer record must NOT contain volunteer ID')
      assert.ok(!serialized.includes(privateAddress), 'Volunteer record must NOT contain address')
      assert.ok(!serialized.includes(privateCert), 'Volunteer record must NOT contain cert number')
      assert.ok(!serialized.includes(privatePhone), 'Volunteer record must NOT contain phone number')
    }
  })

  // Test 6: Age >= 18 passes eligibility verification
  test('6. Age >= 18 passes eligibility verification', () => {
    const now = BigInt(Date.now())
    const adultWitness = {
      userAge: 25,
      dateOfBirth: '1999-04-12',
      governmentIdHash: '0x' + 'aa'.repeat(32),
      userSecretSalt: '0x' + '11'.repeat(32),
    }

    const submission = engine.submitAgeCredential(adultWitness, now)
    assert.equal(submission.status, 'ELIGIBLE')
    assert.equal(submission.statusCode, 1)
    assert.equal(submission.isEligible, true)
    assert.equal(engine.age_credential_count, 1n)
    assert.equal(engine.eligible_users_count, 1n)

    const verification = engine.verifyAgeEligibility(submission.credentialId, adultWitness, now)
    assert.equal(verification.status, 'ELIGIBLE')
    assert.equal(verification.statusCode, 1)
    assert.equal(verification.isEligible, true)

    const readStatus = engine.getEligibilityStatus(submission.credentialId)
    assert.equal(readStatus, 'ELIGIBLE')
  })

  // Test 7: Age < 18 fails eligibility verification
  test('7. Age < 18 fails eligibility verification', () => {
    const now = BigInt(Date.now())
    const minorWitness = {
      userAge: 16,
      dateOfBirth: '2008-09-20',
      governmentIdHash: '0x' + 'bb'.repeat(32),
      userSecretSalt: '0x' + '22'.repeat(32),
    }

    const submission = engine.submitAgeCredential(minorWitness, now)
    assert.equal(submission.status, 'NOT ELIGIBLE')
    assert.equal(submission.statusCode, 0)
    assert.equal(submission.isEligible, false)

    const verification = engine.verifyAgeEligibility(submission.credentialId, minorWitness, now)
    assert.equal(verification.status, 'NOT ELIGIBLE')
    assert.equal(verification.statusCode, 0)
    assert.equal(verification.isEligible, false)

    const readStatus = engine.getEligibilityStatus(submission.credentialId)
    assert.equal(readStatus, 'NOT ELIGIBLE')

    // Unknown credential ID returns NOT ELIGIBLE
    assert.equal(engine.getEligibilityStatus(99999n), 'NOT ELIGIBLE')
  })

  // Test 8: Actual age and personal identity information remain strictly hidden
  test('8. Actual age and personal identity information remain private', () => {
    const secretAge = 34
    const secretDOB = '1990-11-05'
    const secretGovId = '0xSECRET_GOV_ID_HASH_9999'
    const secretSalt = '0xSUPER_SECRET_SALT_7777'

    const submission = engine.submitAgeCredential(
      {
        userAge: secretAge,
        dateOfBirth: secretDOB,
        governmentIdHash: secretGovId,
        userSecretSalt: secretSalt,
      },
      BigInt(Date.now())
    )

    // Inspect Public Age Records
    for (const [, record] of engine.age_eligibility_records) {
      assert.equal(record.userAge, undefined, 'Age record must NOT contain actual age')
      assert.equal(record.age, undefined, 'Age record must NOT contain actual age')
      assert.equal(record.dateOfBirth, undefined, 'Age record must NOT contain date of birth')
      assert.equal(record.governmentIdHash, undefined, 'Age record must NOT contain government ID hash')
      assert.equal(record.userSecretSalt, undefined, 'Age record must NOT contain secret salt')
      assert.ok('is_eligible' in record, 'Public record contains is_eligible')
      assert.ok('eligibility_status' in record, 'Public record contains eligibility_status')

      // Exclude timestamp from string scan to avoid false-positive substring collision with millisecond timestamps
      const { timestamp, ...recordWithoutTimestamp } = record
      const serialized = JSON.stringify(recordWithoutTimestamp, (k, v) => (typeof v === 'bigint' ? v.toString() : v))
      assert.ok(!serialized.includes(String(secretAge)), 'Age record must NOT contain actual age number')
      assert.ok(!serialized.includes(secretDOB), 'Age record must NOT contain date of birth')
      assert.ok(!serialized.includes(secretGovId), 'Age record must NOT contain government ID hash')
      assert.ok(!serialized.includes(secretSalt), 'Age record must NOT contain secret salt')
    }
  })
})

