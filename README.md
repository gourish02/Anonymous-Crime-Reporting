# 🛡️ SafeCity - Privacy-Preserving Public Safety Platform

> **Decentralized, Multi-Module Civic Safety Ecosystem on Midnight Blockchain**
>
> SafeCity is a production-grade, privacy-preserving public safety platform built on the **Midnight Blockchain**. By combining **zero-knowledge cryptography (zk-SNARKs)**, **selective disclosure**, and **real-time AI threat intelligence**, SafeCity enables citizens to report crimes completely anonymously, allows community volunteers to prove active credentials without compromising personal privacy, and verifies **age eligibility (18+)** without exposing dates of birth or identity records.

[![CI/CD Pipeline](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing%20(40%2F40)-brightgreen)](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/ci.yml)
[![Deploy Contract](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/deploy-contract.yml/badge.svg)](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/deploy-contract.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Preprod%20(testnet--02)-green)](https://midnight.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Crime Reporting Module](#-crime-reporting-module)
- [Volunteer Verification Module](#-volunteer-verification-module)
- [Age Eligibility Verification Module](#-age-eligibility-verification-module)
- [Privacy Model](#-privacy-model)
- [Technology Stack](#-technology-stack)
- [Midnight Smart Contracts](#-midnight-smart-contracts)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Future Work](#-future-work)

---

## 🌟 Overview

Public safety and civic reporting systems face three critical privacy and compliance dilemmas:

1. **Whistleblower & Victim Fear**: Citizens witnessing crimes frequently hesitate to report incidents due to fears of retaliation, identity leakage, or surveillance.
2. **Volunteer & First-Responder Doxxing**: Community emergency volunteers (medics, rescue teams, disaster relief coordinators) must repeatedly verify their credentials, exposing sensitive Personally Identifiable Information (PII) such as home addresses, national IDs, and certificate numbers to third parties.
3. **Age Eligibility Gating Without Doxxing**: Public safety systems often require participants to be legal adults (age $\ge$ 18) to submit formal incident reports, yet asking users to scan driver's licenses or submit birth certificates violates basic privacy principles.

**SafeCity** eliminates all three dilemmas by leveraging the **Midnight Blockchain**'s dual-state zero-knowledge architecture. Through local witness generation and on-circuit zero-knowledge proofs ($\pi$), SafeCity proves the validity of reports, volunteer certifications, and age eligibility mathematically on-chain without revealing who filed the report, who holds the credential, or what the user's exact age is.

### 🌐 Preprod Contract Deployment Status

| Parameter | Value |
|---|---|
| **Platform** | SafeCity Decentralized Public Safety Platform |
| **Network** | Midnight Preprod Testnet (`testnet-02`) |
| **Contract Address** | `NOT_CONFIGURED` (Pending Testnet Deployment) |
| **Status** | 🟡 **ZK Cryptographic Simulation Mode** (Verified via Simulator & Pending On-Chain Broadcast) |
| **Module 1 Circuits** | `submitCrimeReport`, `verifyReport`, `getReportStatus`, `updateReportStatus`, `upvoteReport` |
| **Module 2 Circuits** | `submitVolunteerCredential`, `verifyVolunteerCredential`, `getVerificationStatus`, `registerVolunteerCredential`, `proveVolunteerEligibility` |
| **Module 3 Circuits** | `submitAgeCredential`, `verifyAgeEligibility`, `getEligibilityStatus` |
| **Block Explorer** | [Midnight Testnet Explorer](https://testnet.midnightexplorer.com) |
| **Deployment Checklist** | [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) |
| **Verification Report** | [docs/DEPLOYMENT_VERIFICATION_REPORT.md](docs/DEPLOYMENT_VERIFICATION_REPORT.md) |

> ℹ️ **Deployment Verification Note**: The SafeCity smart contracts are written in Midnight Compact 2.0 and thoroughly tested via unit test simulation engines. The contract has **not yet been broadcast to the live Midnight Preprod testnet ledger**; previously referenced `0200` addresses were synthetic offline build artifacts. When running without an on-chain deployment, the dApp seamlessly operates in local cryptographic proof simulation mode. Follow the [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) to fund a Midnight wallet and execute an on-chain deployment.

---

## ✨ Features

- **Zero-Knowledge Anonymous Crime Reporting**: Citizens file incident reports with mathematical zero-knowledge whistleblower guarantees. Neither wallet addresses nor confidential narratives are written to the public ledger.
- **AI Crime Threat Classifier**: Integrated Scikit-Learn ML engine operating alongside FastAPI, offering real-time categorization across 5 critical crime types (`Theft`, `Assault`, `Cyber Crime`, `Fraud`, `Vandalism`) with calibrated probability distributions and 4-tier risk assessment (`Low`, `Medium`, `High`, `Critical`).
- **Confidential Volunteer Verification**: Emergency responders and civic volunteers verify valid, unexpired credentials without exposing personal details through Midnight **selective disclosure**.
- **Age Eligibility Verification (18+)**: Users prove they are of legal age ($\text{age} \ge 18$) before submitting crime reports. Evaluated strictly in zero-knowledge without revealing date of birth, actual age, or government ID.
- **Public Safety Dashboard**: Unified telemetry showcasing aggregate platform statistics, credential health ratios, category breakdowns, and a live demonstration of selective disclosure principles.
- **Tamper-Proof Community Corroboration**: Citizens corroborate on-chain reports through anonymous upvoting without revealing voter identity or wallet balance.
- **Lace Wallet Integration**: Seamless connectivity with Midnight Lace Wallet (`window.midnight.mnLace`), paired with a robust client-side simulation engine for testing and fallback environments.
- **Dual-Network Readiness**: Configured out of the box for both the **Midnight Preprod Testnet (`testnet-02`)** and a self-hosted **Local DevNet** via Docker.

---

## 🏛️ Architecture

SafeCity separates private data processing on the client device from public ledger state updates on the Midnight blockchain across three integrated modules.

```
                    ┌─────────────────────────────────────────┐
                    │     SafeCity Public Safety Platform     │
                    └────────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
        ▼                                ▼                                ▼
  ┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
  │         MODULE 1          │    │         MODULE 2          │    │         MODULE 3          │
  │  Anonymous Crime Report   │    │  Confidential Volunteer   │    │  Age Eligibility (18+)    │
  │       & AI Classifier     │    │       Verification        │    │       Verification        │
  ├───────────────────────────┤    ├───────────────────────────┤    ├───────────────────────────┤
  │ • Lace Wallet Integration │    │ • Selective Disclosure    │    │ • Zero-Knowledge Gating   │
  │ • Compact ZK Circuits     │    │ • Private Witness State   │    │ • age >= 18 Constraint    │
  │ • Scikit-Learn ML Backend │    │ • Conceals all 5 PII vars │    │ • Conceals DOB, Age & ID  │
  │ • Community Upvoting      │    │ • Reveals Active/Expired  │    │ • Reveals ELIGIBLE status │
  └───────────────────────────┘    └───────────────────────────┘    └───────────────────────────┘
```

### End-to-End System Flow

```mermaid
flowchart TB
    subgraph Client["Browser Client (SafeCity Web App)"]
        UI["React 18 + TypeScript UI\n(Vite + React Router v6)"]
        Lace["Lace Wallet Connector\n(window.midnight.mnLace)"]
        LocalML["Local Browser ML Engine\n(Fault-Tolerant Fallback)"]
        
        subgraph ClientWitnesses["ZK Witness Storage (Local In-Memory)"]
            RepWitness["Crime Reporter Witness\n• reporterIdentity\n• crimeDescription\n• evidenceHash"]
            VolWitness["Volunteer Credential Witness\n• name, volunteerId\n• address, certNumber\n• contactInfo, expiryDate"]
            AgeWitness["Age Eligibility Witness\n• userAge, dateOfBirth\n• governmentIdHash\n• userSecretSalt"]
        end
        
        UI --> Lace
        UI --> RepWitness
        UI --> VolWitness
        UI --> AgeWitness
        UI -.->|Fallback| LocalML
    end

    subgraph AIService["AI Threat Classifier Service (FastAPI)"]
        API["FastAPI REST Endpoints\n(/api/classify, /api/categories)"]
        SKLearn["Scikit-Learn ML Pipeline\n(TF-IDF + Logistic Regression)"]
        RiskEngine["Multi-Factor Threat Engine\n(Low, Medium, High, Critical)"]
        
        API --> SKLearn
        API --> RiskEngine
    end

    subgraph MidnightNetwork["Midnight Network Infrastructure"]
        ProofServer["Midnight Proof Server\n(Generates zk-SNARKs π)"]
        Indexer["Midnight GraphQL Indexer\n(Indexes ledger state)"]
        NodeRPC["Midnight Node RPC\n(Submits transactions)"]
    end

    subgraph OnChain["Midnight Blockchain (Preprod Testnet)"]
        CompactContract["SafeCity Compact Smart Contract\n(contract/src/crime_report.compact)"]
        
        subgraph Mod1State["Module 1: Crime Reporting Ledger"]
            RepCount["report_count: Counter"]
            PubReports["public_reports: Map<Field, PublicReport>"]
            VerCount["verified_count: Counter"]
            TypeCount["type_counts: Map<Uint<8>, Uint<32>>"]
        end

        subgraph Mod2State["Module 2: Confidential Volunteer Ledger"]
            VolCount["volunteer_count: Counter"]
            ActiveVolCount["active_volunteers_count: Counter"]
            VolMap["volunteer_credentials: Map<Bytes<32>, VolunteerAttestation>"]
        end

        subgraph Mod3State["Module 3: Age Eligibility Ledger"]
            AgeCount["age_credential_count: Counter"]
            EligibleCount["eligible_users_count: Counter"]
            AgeMap["age_eligibility_status: Map<Field, Uint<8>>"]
        end

        CompactContract --> Mod1State
        CompactContract --> Mod2State
        CompactContract --> Mod3State
    end

    UI -->|Incident Narrative| API
    RepWitness -->|Witness Inputs| ProofServer
    VolWitness -->|Selective Disclosure Witness| ProofServer
    AgeWitness -->|Age Verification Witness| ProofServer
    ProofServer -->|Proof π & Public Inputs| Lace
    Lace -->|Signed Transaction| NodeRPC
    NodeRPC --> CompactContract
    Indexer -->|GraphQL Queries| UI
```

---

## 🚨 Crime Reporting Module

The Crime Reporting Module protects whistleblowers and victims reporting illegal acts.

### Workflow
1. **Age Gating**: The user proves they are at least 18 years old via Module 3 without disclosing their birth date.
2. **Confidential Entry**: The reporter enters incident details (category, location, incident narrative, evidence files).
3. **AI Threat Assessment**: The narrative is analyzed by the AI Classifier, suggesting the category, confidence score, and urgency rating.
4. **Local Witness Generation**: The reporter's identity, narrative, and evidence hash are stored exclusively in local memory as private witnesses.
5. **ZK Proof Creation**: The Midnight Proof Server constructs a zero-knowledge proof ($\pi$) confirming the report is formatted correctly and backed by a valid commitment.
6. **Ledger Inscription**: The contract increments the public `report_count` and stores the public attestation with a `Pending` verification status.

### State Separation

```
Private Witness State (Device-Local)      Public Ledger State (On-Chain)
├── reporterIdentity                      ├── reportId (Counter sequence)
├── crimeDescription                      ├── verificationStatus (Pending/Verified/Rejected)
└── evidenceHash                          ├── timestamp (Block epoch)
                                          ├── category (Taxonomy index)
                                          └── upvotes (Community corroboration)
```

### Module 1 Circuits
- `submitCrimeReport()`: Proves a valid report exists without publishing reporter identity or raw text.
- `verifyReport()`: Allows authorized community reviewers to transition report status to `Verified` or `Rejected`.
- `getReportStatus()`: Public read circuit providing verifiable report lifecycle status.
- `updateReportStatus()`: Transitions status code based on verified evidence review.
- `upvoteReport()`: Allows citizens to corroborate incidents anonymously.

---

## 🎖️ Volunteer Verification Module

The Volunteer Verification Module resolves the privacy challenge faced by community first responders, search-and-rescue personnel, and medical volunteers.

### The Problem
Traditional credential verification forces volunteers to display certificates containing full names, government IDs, physical home addresses, and phone numbers to arbitrary coordinators.

### The SafeCity Solution: Selective Disclosure
Using Midnight's private witness engine, the volunteer proves they hold an authentic, unexpired certification issued by an authorized entity without revealing any personal details.

### State Separation

```
Private Witness State (Device-Local)      Public Ledger State (On-Chain)
├── volunteerName                         ├── verificationStatus:
├── volunteerId                           │     0 = NOT VERIFIED
├── credentialHash                        │     1 = VERIFIED
├── certificateNumber                     │     2 = ACTIVE
├── address                               │     3 = EXPIRED
├── phoneNumber                           └── timestamp (Verification epoch)
└── expiryDate
```

### Module 2 Circuits
- `submitVolunteerCredential()`: Computes a cryptographic commitment over all 7 private fields and registers the credential hash on the ledger.
- `verifyVolunteerCredential()`: Validates that the credential matches an authorized issuing registry without exposing plaintext records.
- `getVerificationStatus()`: Retrieves public verification status.
- `registerVolunteerCredential()`: Registers active credential hashes for authorized organizations.
- `proveVolunteerEligibility()`: Performs an on-circuit comparison:
  $$\text{isValid} = (\text{credentialMatches}) \land (\text{expiryDate} \ge \text{currentTime})$$
  The circuit emits **strictly** the public status enum, completely hiding the actual expiration timestamp and personal data.

### Frontend Display
Upon successful verification, the user interface displays:

```
┌───────────────────────────────────────────────┐
│              ✓ Verified Volunteer             │
│                                               │
│  Status: ACTIVE                               │
│  Verification: VERIFIED                       │
│  Identity: Protected by Zero-Knowledge Proof  │
└───────────────────────────────────────────────┘
```
No name, volunteer ID, address, certificate number, or contact information is ever displayed or stored.

---

## 🎂 Age Eligibility Verification Module

The Age Eligibility Verification Module enforces age requirements ($\text{age} \ge 18$) before users access public safety reporting features, without compromising privacy.

### Goal
Users must prove they are at least 18 years old before submitting crime reports or participating in adult public safety activities, without disclosing their birth date, actual age, or government ID.

### Flow
1. **Connect Lace Wallet**: Authenticate with Midnight Lace wallet (`window.midnight.mnLace`).
2. **Enter Private Age Credentials**: Input date of birth and ID credentials into local device memory.
3. **Execute ZK Age Circuit**: Evaluates the arithmetic constraint $\text{age} \ge 18$ inside zero-knowledge proof $\pi$.
4. **Display Eligibility Result**: The ledger and UI display only the binary outcome:
   - `✓ ELIGIBLE` ($\text{statusCode} = 1$)
   - `✗ NOT ELIGIBLE` ($\text{statusCode} = 0$)

### State Separation

```
Private Witness State (Device-Local)      Public Ledger State (On-Chain)
├── userAge (e.g. 26)                     ├── eligibility_status:
├── dateOfBirth (e.g. 1998-05-14)         │     0 = NOT ELIGIBLE
├── governmentIdHash                      │     1 = ELIGIBLE
└── userSecretSalt                        └── timestamp (Verification epoch)
```

### Module 3 Circuits
- `submitAgeCredential(timestamp)`: Evaluates private witnesses `userAge()`, `dateOfBirth()`, `governmentIdHash()`, and `userSecretSalt()`. Proves in zero-knowledge whether $\text{age} \ge 18$ and registers the public status enum.
- `verifyAgeEligibility(credential_id, current_time)`: Re-verifies existing age credential status against current time parameters in zero-knowledge.
- `getEligibilityStatus(credential_id)`: Read-only public query circuit returning `ELIGIBLE` or `NOT ELIGIBLE`.

### Frontend Integration
- **Direct Age Verification Page (`/age-verify`, `/age`)**: Dedicated interactive flow with preset personas (`Eligible Adult`, `Senior Member`, `Underage User (Testing)`), real-time ZK proof metrics, and selective disclosure matrix.
- **Reporting Gate Integration**: `SubmitReportPage` displays an Age Verified badge (`✓ Age Verified (18+)`) when verified, and prompts unverified users to complete verification before submitting.
- **Volunteer Integration**: Volunteer portal displays cross-module verified age status.

---

## 🔒 Privacy Model

SafeCity's privacy architecture provides mathematical privacy guarantees. The table below outlines what observers on the network can and cannot learn across all three platform modules.

### Explicit Privacy Disclosure Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SAFECITY PRIVACY MATRIX                           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│       WHAT OBSERVERS CAN LEARN       │     WHAT OBSERVERS CANNOT LEARN      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  ✅ Verification Status              │  ❌ Volunteer Identity               │
│     • Volunteer: Verified / Active   │     • Legal Name                     │
│     • Volunteer: Expired / Invalid   │     • Government / Volunteer ID      │
│     • Crime Report: Verified/Pending │                                      │
│                                      │  ❌ Credential Contents              │
│  ✅ Age Eligibility Status (Module 3)│     • Certificate Number             │
│     • ELIGIBLE (age >= 18)           │     • Issuing Authority Details      │
│     • NOT ELIGIBLE (age < 18)        │     • Exact Expiration Date          │
│                                      │     • Credential Hash Pre-Image      │
│  ✅ Aggregate Statistics             │                                      │
│     • Total Crime Reports            │  ❌ Age & Birthdate Data (Module 3)  │
│     • Verified Crime Reports         │     • Actual Age in years (e.g. 26)  │
│     • Total Volunteer Credentials    │     • Exact Date of Birth            │
│     • Active Volunteer Count         │     • Government ID / Passport No.   │
│     • Total Eligible Users Count     │     • Blinding Identity Salt         │
│     • Category Taxonomy Breakdown    │                                      │
│                                      │  ❌ Reporter Identity                │
│  ✅ Report Metadata (Public Only)    │     • Wallet Public Key / Address    │
│     • Report ID                      │     • IP Address / Origin            │
│     • Crime Category Code            │     • Reporter Witness Key           │
│     • Timestamp (Block Time)         │                                      │
│     • Corroboration Upvote Count     │  ❌ Personal Information             │
│                                      │     • Residential Street Address     │
│                                      │     • Telephone / Mobile Number      │
│                                      │     • Personal Email Address         │
│                                      │     • Raw Narrative / Narrative PII  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Cryptographic Guarantees

1. **Zero-Knowledge Property**: The zk-SNARK proof $\pi$ reveals zero computational information beyond the truth of the statement. An observer cannot distinguish between different users.
2. **Pedersen & Poseidon Commitments**: Private witnesses are bound to on-chain attestations using collision-resistant cryptographic commitments:
   $$\text{commitment} = \mathcal{H}(\text{fullName} \parallel \text{dateOfBirth} \parallel \text{governmentId} \parallel \text{salt})$$
3. **Local Witness Confinement**: Private witness variables exist strictly in browser client memory during proof construction and are never transmitted over HTTP, RPC, or WebSocket channels.
4. **On-Circuit Inequality Comparison**: Age eligibility checks happen inside arithmetic circuits via $\text{age} \ge 18$. The ledger only learns the binary outcome boolean, keeping the actual age and date of birth completely confidential.

---

## 💻 Technology Stack

### Frontend & Web Application
- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **Styling**: Vanilla CSS with Catppuccin Mocha tokens (glassmorphism, dark aesthetic, responsive grid)
- **Icons**: Lucide React

### Midnight Blockchain & ZK Layer
- **Smart Contract Language**: Compact (`pragma language_version >= 0.20`)
- **Blockchain Network**: Midnight Preprod Testnet (`testnet-02`) & Local DevNet
- **SDK**: Midnight.js DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **Wallet**: Lace Wallet (`window.midnight.mnLace`)
- **Proof Generation**: Midnight Proof Server (Local & Preprod daemon)
- **Data Indexing**: Midnight GraphQL Indexer

### AI Threat Classifier Service
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn ASGI
- **ML Pipeline**: Scikit-Learn
  - `TfidfVectorizer` (sublinear term-frequency, n-gram ranges 1-2)
  - `LogisticRegression` (calibrated multi-class classification)
- **Validation**: Pydantic v2 data models

### Testing & Infrastructure
- **Frontend Testing**: Vitest
- **Contract Testing**: Node.js ESM contract simulation runner
- **Python Testing**: Python `unittest` & FastAPI `TestClient`
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend), Docker (Local DevNet & AI Microservice)

---

## 📜 Midnight Smart Contracts

The SafeCity smart contract is written in **Compact** and located at [`contract/src/crime_report.compact`](contract/src/crime_report.compact).

### Circuit Specifications

#### Module 1: Anonymous Crime Reporting
```compact
export circuit submitCrimeReport(category: Uint<8>, witness: CrimeWitness): ReportId
export circuit verifyReport(reportId: Field, newStatus: Uint<8>): Boolean
export circuit getReportStatus(reportId: Field): Uint<8>
export circuit upvoteReport(reportId: Field): Uint<32>
```

#### Module 2: Confidential Volunteer Verification
```compact
export circuit submitVolunteerCredential(timestamp: Uint<64>): Field
export circuit verifyVolunteerCredential(credential_id: Field, current_time: Uint<64>): Uint<8>
export circuit getVerificationStatus(credential_id: Field): Uint<8>
export circuit registerVolunteerCredential(commitment: Bytes<32>, attested_at: Uint<64>): Bytes<32>
export circuit proveVolunteerEligibility(commitment: Bytes<32>, current_time: Uint<64>): Boolean
```

#### Module 3: Age Eligibility Verification (18+)
```compact
// Submits age verification proof using private witnesses: userAge, dateOfBirth, govId, salt
export circuit submitAgeCredential(timestamp: Uint<64>): Field

// Re-verifies age eligibility constraint (age >= 18) in zero-knowledge
export circuit verifyAgeEligibility(credential_id: Field, current_time: Uint<64>): Uint<8>

// Public view circuit returning status: 1 = ELIGIBLE, 0 = NOT ELIGIBLE
export circuit getEligibilityStatus(credential_id: Field): Uint<8>
```

---

## 🧪 Testing

SafeCity features a comprehensive multi-tier automated test suite covering all architectural layers. All 40 tests execute and pass automatically.

```
SafeCity Automated Test Suite
├── Compact Smart Contract Tests   8 / 8 passed (100%)
├── Frontend & DApp Tests         17 / 17 passed (100%)
└── AI Classifier & API Tests     15 / 15 passed (100%)
Total: 40 / 40 passing
```

### 1. Midnight Compact Contract Test Suite (8 Tests)
Located in [`contract/test/crime_report.contract-test.mjs`](contract/test/crime_report.contract-test.mjs):
1. **Crime report submission succeeds**: Submits report with private witness, validates report ID incrementation and ledger commitment.
2. **Crime report verification succeeds**: Authorized reviewer verifies report, transitioning status from `Pending` to `Verified`.
3. **Valid volunteer credential verifies**: Verifies credential with future expiration date, returning status `VERIFIED` and `ACTIVE`.
4. **Expired credential fails verification**: Submits credential with past expiration date; the circuit correctly outputs `EXPIRED`.
5. **Private identity information remains hidden**: Validates that zero private witness fields appear in the public ledger state.
6. **Age $\ge$ 18 passes eligibility verification**: Evaluates adult witness, successfully outputting `ELIGIBLE` (status code 1).
7. **Age $<$ 18 fails eligibility verification**: Evaluates minor witness ($\text{age} < 18$), correctly outputting `NOT ELIGIBLE` (status code 0).
8. **Actual age and personal identity information remain private**: Serializes ledger state and verifies that actual age numbers, birth dates, and ID hashes are never stored on-chain.

### 2. Frontend & DApp Test Suite (17 Tests)
Located in [`src/__tests__/`](src/__tests__/):
- Verifies wallet connection handling, crime submission, volunteer selective disclosure, BigInt serialization, and complete Age Eligibility verification circuits (Age $\ge$ 18 passes, Age $<$ 18 fails, actual age remains private).

### 3. AI Classifier & API Test Suite (15 Tests)
Located in [`backend/test_classifier.py`](backend/test_classifier.py) and [`backend/test_api.py`](backend/test_api.py):
- Tests category classifications (`Theft`, `Assault`, `Cyber Crime`, `Fraud`, `Vandalism`), threat risk scoring, input sanitation, and FastAPI endpoints.

### Executing Tests Locally

```bash
# Run Midnight Compact contract test suite (8 tests)
npm run test:contract

# Run frontend Vitest suite (17 tests)
npm test

# Run Python AI backend tests (15 tests)
npm run ai:test

# Run all test suites across the entire repository
npm run test:all
```

---

## 🔄 CI/CD

Continuous Integration and Continuous Delivery is managed through **GitHub Actions** via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Pipeline Characteristics
- **Push Trigger**: Runs automatically on every push to any branch (`branches: ['**']`).
- **Pull Request Trigger**: Runs on every pull request against any branch (`branches: ['**']`).
- **Parallel Execution**: Three isolated jobs execute concurrently on Ubuntu runners:

```mermaid
flowchart LR
    PushOrPR["Event: Push or Pull Request"] --> J1["Job 1: frontend-ci\n• Node 20 Setup\n• npm install\n• type-check & lint\n• npm test (Vitest)\n• npm run build\n• Upload dist artifact"]
    PushOrPR --> J2["Job 2: contract-ci\n• Node 20 Setup\n• Compact Syntax Check\n• Validate Circuits (Mod 1, 2, 3)\n• contract-test.mjs (8 tests)"]
    PushOrPR --> J3["Job 3: ai-backend-ci\n• Python 3.11 Setup\n• pip install\n• train.py Pipeline\n• test_classifier.py\n• test_api.py (15 tests)"]
```

### Live Status Badge
```markdown
[![CI/CD Pipeline](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gourish02/Anonymous-Crime-Reporting/actions/workflows/ci.yml)
```

---

## 🚀 Deployment

### Prerequisites
- **Node.js**: v18.0.0 or v20.x
- **Python**: v3.10+
- **Midnight Lace Wallet Extension**
- **Git**

### 1. Installation

```bash
git clone https://github.com/gourish02/Anonymous-Crime-Reporting.git
cd Anonymous-Crime-Reporting

# Install frontend dependencies
npm install

# Install Python backend dependencies
pip install -r backend/requirements.txt
```

### 2. Environment Configuration

Create a `.env` file from the provided template:

```bash
cp .env.example .env
```

| Variable | Description | Default / Fallback |
|---|---|---|
| `VITE_MIDNIGHT_NETWORK` | Network target (`preprod` or `devnet`) | `preprod` |
| `VITE_CONTRACT_ADDRESS_PREPROD` | Preprod contract address (falls back to `NOT_CONFIGURED` simulation mode if unset) | `NOT_CONFIGURED` |
| `VITE_CONTRACT_ADDRESS_DEVNET` | Local DevNet contract address | `NOT_CONFIGURED` |
| `VITE_AI_BACKEND_URL` | FastAPI service base URL | `http://localhost:8000` |
| `VITE_INDEXER_URL_PREPROD` | Midnight GraphQL Indexer endpoint | `https://indexer.testnet-02.midnight.network/api/v1/graphql` |
| `VITE_PROOF_SERVER_URL` | Midnight Proof Server endpoint | `http://localhost:6300` |

### 3. Running Services

```bash
# Terminal 1: Launch FastAPI AI backend (Port 8000)
npm run ai:server

# Terminal 2: Launch Vite React frontend (Port 3000)
npm run dev
```

### 4. Deploying Smart Contracts
The SafeCity contracts are verified using local cryptographic simulation. To deploy to the live Midnight Preprod Testnet:

1. Follow the comprehensive [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) to set up Docker, compile Compact contracts, and acquire testnet tokens.
2. Run the deployment script with your funded seed phrase:
```bash
$env:MIDNIGHT_SEED="your 24-word seed phrase"
node deploy/deploy.mjs --network preprod
```
3. Update your `.env` or Vercel environment variables with the newly generated on-chain address.

### 5. Production Web Deployment (Vercel)
The web application is pre-configured for Vercel deployment with single-page app rewrites and standard environment variables in [`vercel.json`](vercel.json).

> ⚠️ **Important for Vercel Deployments**:
> - Always configure standard Vercel environment variables under **Project Settings → Environment Variables** (`VITE_CONTRACT_ADDRESS_PREPROD`).
> - Do **not** reference legacy Vercel Secrets (`@contract_address_preprod`), which will cause deployment build failures.
> - Built-in fallback support ensures that if `VITE_CONTRACT_ADDRESS_PREPROD` is omitted, the application compiles cleanly with `NOT_CONFIGURED` fallback and displays a user-friendly status banner.

```bash
npm run build
vercel deploy --prod
```

---

## 📸 Screenshots

| 1. SafeCity Public Safety Dashboard & Telemetry | 2. Submit Crime Report with AI Threat Assistant |
|:---:|:---:|
| ![SafeCity Dashboard](docs/screenshots/dashboard_home.jpg) | ![Submit Report Form with AI Assistant](docs/screenshots/submit_report.jpg) |
| *Dual-module telemetry, 5 safety metrics, and selective disclosure live demonstration* | *Zero-knowledge witness form with real-time Scikit-Learn threat categorization* |

| 3. Zero-Knowledge Crime Report Verification | 4. AI Crime Classifier & Risk Assessment Lab |
|:---:|:---:|
| ![Zero-Knowledge Report Verification](docs/screenshots/verification_screen.jpg) | ![AI Crime Classifier Lab](docs/screenshots/ai_classifier_lab.jpg) |
| *Verifies report validity on-chain without revealing reporter wallet or narrative* | *Probability distribution across 5 crime classes with multi-factor risk engine* |

> 🔍 For extended walk-throughs and detailed UI component analysis, see [**docs/SCREENSHOTS.md**](docs/SCREENSHOTS.md).

---

## 🔮 Future Work

- **Zero-Knowledge Geospatial Proximity Proofs**: Enable reporters and volunteers to prove they are within a specific incident district or perimeter (using geohashes or polygonal range proofs) without exposing exact GPS coordinates.
- **Decentralized Reviewer DAO & Multi-Signature Attestations**: Replace single-reviewer report verification with a distributed committee of verified volunteers voting via threshold zero-knowledge signatures.
- **Client-Side WASM Proof Generation**: Fully package the Midnight Proof Server into WebAssembly to allow in-browser and mobile proving without requiring local proof server daemons.
- **Cardano Cross-Chain Volunteer Rewards**: Implement a cross-chain bridge to Cardano to distribute non-fungible reputation credentials or incentive tokens to verified volunteers while preserving privacy on Midnight.
- **Privacy-Preserving Federated Learning**: Enable decentralized model fine-tuning for the AI Crime Classifier directly across local client devices using differential privacy, ensuring incident text never leaves citizens' phones.

---

## 🤝 Contributing

Contributions to SafeCity are welcome! Please check our [**CONTRIBUTING.md**](CONTRIBUTING.md) for contribution guidelines, code conventions, and pull request procedures.

---

## 📄 License

SafeCity is released under the open-source [**MIT License**](LICENSE).
