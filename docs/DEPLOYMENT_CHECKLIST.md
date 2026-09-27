# 📋 SafeCity Midnight Smart Contract Deployment Checklist

This document provides a production-grade, step-by-step checklist for deploying the **SafeCity Anonymous Crime Reporting & Volunteer Verification** smart contract to the **Midnight Preprod Testnet** (`testnet-02`) or a local **DevNet**.

---

## 🎯 Status Overview

| Item | Current Status | Notes |
|---|---|---|
| **Contract Language** | Midnight Compact 2.0 (`contract/src/crime_report.compact`) | Implements 3 privacy modules |
| **Unit Verification** | ✅ Passing (11/11 tests green) | Verified via `MidnightCompactTestEngine` simulator |
| **Live Ledger Status** | 🟡 **Pending On-Chain Deployment** | Operates in local ZK proof simulation mode |
| **Active Network** | Preprod Testnet (`testnet-02`) | Target network for deployment |

---

## 🛠️ Step 1: Pre-requisites & Environment Setup

Before deploying to the Midnight network, ensure the following tools are installed and available:

- [ ] **Docker Engine**: Installed and running (v24+ recommended).
  ```bash
  docker info
  ```
- [ ] **Midnight Proof Server**: Running locally or accessible remotely.
  ```bash
  docker run -d \
    --name midnight-proof-server \
    -p 6300:6300 \
    midnightnetwork/midnight-proof-server:latest
  
  # Verify health
  curl http://localhost:6300/health
  # {"status":"ok"}
  ```
- [ ] **Midnight Lace Wallet**:
  - Installed in Chrome/Brave from the official Midnight developer portal.
  - Set network to **Preprod Testnet (`testnet-02`)**.
  - Copy and securely store your **24-word recovery seed phrase**.
- [ ] **Testnet Token Funding (tDUST)**:
  - Obtain testnet tokens from the official Midnight Preprod Faucet:
    `https://faucet.testnet-02.midnight.network`
  - Confirm received balance in your Lace wallet before proceeding.

---

## 🔨 Step 2: Contract Compilation & Proving Key Generation

The SafeCity contract is written in Compact (`contract/src/crime_report.compact`).

- [ ] **Run Compact Compiler via Docker**:
  ```bash
  docker run --rm \
    -v "${PWD}/contract:/contract" \
    ghcr.io/midnight-ntwrk/compactc:latest \
    /contract/src/crime_report.compact \
    /contract/dist/
  ```

- [ ] **Verify Artifact Generation**:
  Ensure the following files are generated in `contract/dist/`:
  - `crime_report.midnight` (Compiled zero-knowledge circuit bytecode)
  - `manifest.json` (Circuit ABI and manifest metadata)
  - Proving and verification keys

- [ ] **Execute Automated Local Simulation Tests**:
  ```bash
  # Execute contract test engine
  node contract/test/crime_report.contract-test.mjs

  # Execute full frontend & circuit test suite
  npm test
  ```
  All tests must pass (11/11).

---

## 🚀 Step 3: On-Chain Deployment Execution

- [ ] **Set Wallet Seed Environment Variable**:
  > ⚠️ **Security Notice**: Never commit your seed phrase to Git or paste it in public files.
  
  **PowerShell (Windows)**:
  ```powershell
  $env:MIDNIGHT_SEED="your twenty four word testnet recovery seed phrase"
  $env:MIDNIGHT_NETWORK="preprod"
  ```
  
  **Bash (Linux / macOS)**:
  ```bash
  export MIDNIGHT_SEED="your twenty four word testnet recovery seed phrase"
  export MIDNIGHT_NETWORK="preprod"
  ```

- [ ] **Run Deployment Script**:
  ```bash
  node deploy/deploy.mjs
  ```
  
  *Alternative (Direct via Midnight CLI)*:
  ```bash
  docker run --rm \
    -e MIDNIGHT_SEED="$MIDNIGHT_SEED" \
    -e MIDNIGHT_NETWORK="preprod" \
    -e MIDNIGHT_NODE_URI="https://rpc.testnet-02.midnight.network" \
    -e MIDNIGHT_INDEXER_URI="https://indexer.testnet-02.midnight.network/api/v1/graphql" \
    -e MIDNIGHT_PROOF_SERVER_URI="https://proof-server.testnet-02.midnight.network" \
    -v "${PWD}/contract/dist:/dist" \
    ghcr.io/midnight-ntwrk/midnight-cli:latest \
    deploy /dist/crime_report.midnight --output-format json
  ```

- [ ] **Record Deployment Output**:
  Save the following outputs from the CLI execution:
  - **Deployed Contract Address**: (Format: `0200` + 60 hex characters, total 64 chars)
  - **Deployment Transaction Hash**: (Format: `0x...` or `tx_...`)
  - **Block Number / Height**: The block in which the deployment was included.

---

## 🔍 Step 4: Explorer & On-Chain Verification

- [ ] **Open Midnight Explorer**:
  Visit [Midnight Preprod Explorer](https://preprod.midnightexplorer.com) or [Midnight Subscan Preprod](https://midnight-preprod.subscan.io).

- [ ] **Search Deployed Contract Address**:
  - Enter your 64-character contract address in the search box.
  - Verify that the contract code and state are indexed.
  - Confirm the circuits are listed:
    - `submitCrimeReport`
    - `verifyReport`
    - `submitVolunteerCredential`
    - `verifyVolunteerCredential`
    - `submitAgeCredential`
    - `verifyAgeEligibility`

- [ ] **Inspect Deployment Transaction**:
  - Search the deployment transaction hash.
  - Confirm transaction status: `SUCCESS` / `CONFIRMED`.

---

## 🌐 Step 5: Frontend & Vercel Configuration

Once the real on-chain contract address is obtained:

- [ ] **Update Local Environment File (`.env`)**:
  ```env
  VITE_MIDNIGHT_NETWORK=preprod
  VITE_CONTRACT_ADDRESS_PREPROD=<your-real-deployed-contract-address>
  ```

- [ ] **Update Vercel Project Environment Variables**:
  1. Go to [Vercel Dashboard](https://vercel.com) → **SafeCity Project**.
  2. Navigate to **Settings → Environment Variables**.
  3. Add or update:
     - **Key**: `VITE_CONTRACT_ADDRESS_PREPROD`
     - **Value**: `<your-real-deployed-contract-address>`
     - **Environments**: Production, Preview, Development.
  > ⚠️ **Important**: Use standard plaintext environment variables. Do **not** use deprecated CLI secret references.

- [ ] **Redeploy Web Application**:
  ```bash
  # Trigger production deployment
  vercel --prod
  ```

- [ ] **Verify Live Application UI**:
  - Open the live URL.
  - Confirm that the `Contract Not Configured` warning banner is **dismissed**.
  - Navigate to `/dashboard` and check the **Midnight Contract Address** card:
    - It should display your active deployed address with a "Copy" button.
  - Test connecting Midnight Lace Wallet.
  - Submit an incident report and verify the zero-knowledge proof generation and on-chain transaction receipt!
