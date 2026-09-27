# 🛡️ SafeCity Midnight Smart Contract Deployment Verification Report

**Date of Verification:** September 27, 2026  
**Auditor / System:** Antigravity Advanced Agentic Verification  
**Repository:** `gourish02/Anonymous-Crime-Reporting`  
**Target Platform:** Midnight Blockchain (Preprod Testnet `testnet-02`)  

---

## 📑 1. Executive Summary

A comprehensive forensic audit was conducted on the SafeCity repository to verify whether the SafeCity Midnight smart contract was actually deployed to the Midnight Preprod Testnet or DevNet.

### 🏁 Final Verification Verdict: **NOT DEPLOYED ON-CHAIN**

| Verification Criterion | Finding | Verdict |
|---|---|---|
| **On-Chain Ledger Inclusion** | No transaction was broadcast to `rpc.testnet-02.midnight.network` or mined into a block. | ❌ Not Deployed |
| **Contract Address Validity** | Addresses (such as `0200fd03...`) were deterministically generated client-side via SHA-256 strings in offline CI scripts. | ❌ Synthetic / Placeholder |
| **Transaction Hashes** | Hashes (such as `tx_...`) were fabricated by hashing string timestamps locally. | ❌ Fake / Simulated |
| **Compiler Bytecode** | `contract/dist/crime_report.midnight` is only a 32-byte hash buffer, not compiled ZK bytecode keys. | ❌ Stub / Incomplete |
| **Local ZK Proof Simulation Engine** | In-memory unit test simulator (`MidnightCompactTestEngine`) executes and passes all logic. | ✅ Verified & Functional |

---

## 🔎 2. Forensic Inspection of Artifacts

### A. Inspection of `deploy/` (`deploy/deploy.mjs`)
- **Inspection Findings:**
  - `deploy/deploy.mjs` checks for Docker and attempts `compactc` / `midnight-cli`.
  - When Docker or `midnight-cli` is absent (the default in non-containerized environments), the script fell back to:
    ```javascript
    const salt = crypto.createHash('sha256').update(SEED).digest('hex');
    const rawAddr = crypto.createHash('sha256').update(salt + contractHash + NETWORK).digest('hex');
    contractAddress = '0200' + rawAddr.substring(4);
    txHash = 'tx_' + crypto.createHash('sha256').update(contractAddress + 'preprod_genesis').digest('hex');
    ```
  - This produced synthetic `0200` addresses and synthetic `tx_...` hashes without sending any bytes to the network RPC node.
  - **Action Taken:** Removed the synthetic address fallback in `deploy/deploy.mjs`. It now fails gracefully with an actionable error directing operators to `docs/DEPLOYMENT_CHECKLIST.md`.

### B. Inspection of `contract/`
- **`contract/src/crime_report.compact`**:
  - Implements the complete Compact 2.0 contract logic across Anonymous Crime Reporting, Volunteer Verification, and Age Eligibility.
- **`contract/dist/manifest.json`**:
  - Hardcoded `0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e` was injected by an inline Node.js script.
  - **Action Taken:** Updated `contractAddress` to `"NOT_CONFIGURED"` and status to `"pending_deployment"`.
- **`contract/dist/crime_report.midnight`**:
  - Exactly 32 bytes in size (`Buffer.from(hash, 'hex')`), which is a plain SHA-256 string hash rather than proving/verification keys produced by `compactc`.
- **`contract/test/crime_report.contract-test.mjs`**:
  - Contains `MidnightCompactTestEngine` simulating Midnight circuits with `node:test`. All 5 circuit suites pass locally.

### C. Inspection of GitHub Actions Logs & Workflows
- **Workflow `.github/workflows/deploy-contract.yml`**:
  - Analyzed run history (Runs `36272054005`, `36270212399`, `36269804968`):
    - **Compiler Step:** Log reveals:
      `Exception: crime_report.compact line 383 char 10: parse error: found "crime_type" looking for "("`
      The step appended `|| true`, allowing the pipeline to continue despite compiler failure.
    - **Deployment Step:** Injected a deterministic offline address `0200...` and appended it to `$GITHUB_OUTPUT` without connecting to any Midnight node.
  - **Action Taken:** Updated `.github/workflows/deploy-contract.yml` to remove fake addresses and accurately report `Pending Testnet Deployment (Local ZK Simulation Active)`.

---

## 📊 3. Exact Determinations

### 1. Actual Network Used
- **Determined Network:** **None / Local Simulation Mode**.
- While configuration files specify target endpoints for `testnet-02` (`https://rpc.testnet-02.midnight.network`), no RPC requests or WebSocket connections were opened to the network during any deployment workflow or script run.

### 2. Actual Contract Address
- **Determined Address:** **None exists on-chain**.
- The address `0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e` is a synthetic hash string created offline.
- Status is now set to **`NOT_CONFIGURED`** until an on-chain deployment is executed.

### 3. Deployment Transaction Details
- **Transaction Hash:** **None**.
- The string `tx_...` was generated via `crypto.createHash('sha256').update(contractAddress + Date.now()).digest('hex')` and has no corresponding transaction on the Midnight block ledger.

---

## 🛠️ 4. Corrective Actions Completed

In accordance with user instructions for uncompleted deployments:

1. **Removed All Fake / Placeholder Contract Addresses**:
   - Cleared `0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e` from `README.md`, `docs/DEPLOYMENT.md`, `vercel.json`, `.env`, `.env.example`, `contract/dist/manifest.json`, `src/config/networks.ts`, `src/api/midnight.ts`, and `.github/workflows/deploy-contract.yml`.
   - Updated `src/config/networks.ts` and `src/api/midnight.ts` so that unconfigured environments cleanly fall back to `"NOT_CONFIGURED"` and activate local simulation mode.
2. **Updated Documentation**:
   - `README.md`: Updated the Preprod Deployment Status table to show `🟡 ZK Cryptographic Simulation Mode (Verified via Simulator & Pending On-Chain Broadcast)`.
   - `docs/DEPLOYMENT.md`: Clarified the deployment process and removed hardcoded fake contract addresses.
3. **Created Deployment Checklist**:
   - Created [`docs/DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) providing clear instructions to install Docker, start the proof server, fund a wallet with testnet tDUST, compile the contract, and broadcast it on-chain.
4. **Preserved Test Suite & Build Stability**:
   - All 11 frontend/circuit tests pass.
   - Vite production build compiles without errors.

---

## 🚀 5. Next Steps for Live Deployment

To complete the transition from simulation mode to a live on-chain contract:

1. Follow the steps in [docs/DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).
2. Obtain tDUST from `https://faucet.testnet-02.midnight.network`.
3. Run `compactc` via Docker to generate real circuit proving keys.
4. Execute `midnight-cli deploy` with your funded seed phrase.
5. Search the generated address on [Midnight Preprod Explorer](https://preprod.midnightexplorer.com).
6. Update `VITE_CONTRACT_ADDRESS_PREPROD` in Vercel and `.env`.
