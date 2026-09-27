# Deployment Guide

This document covers all deployment scenarios for the Anonymous Crime Reporting dApp.

## Table of Contents

- [Preprod Testnet (Recommended)](#preprod-testnet)
- [Local Devnet](#local-devnet)
- [Vercel Frontend Hosting](#vercel-frontend-hosting)
- [Proof Server Setup](#proof-server-setup)
- [Environment Variables Reference](#environment-variables-reference)

---

## Preprod Testnet

### 1. Get Testnet tDUST

1. Install [Lace Wallet](https://www.lace.io/) browser extension
2. Switch to **Preprod** network
3. Request tDUST from the Midnight faucet: https://faucet.testnet-02.midnight.network

### 2. Compile the Contract

```bash
# Install Compact compiler
npm install -g @midnight-ntwrk/compactc

# Compile
cd contract
compactc src/crime_report.compact dist/

# Output files:
# dist/crime_report.midnight      ← deployable bundle
# dist/crime_report_keys.json     ← proving/verifying keys
```

### 3. Deploy Contract

```bash
midnight deploy \
  --network preprod \
  --contract dist/crime_report.midnight \
  --keys dist/crime_report_keys.json \
  --wallet /path/to/wallet.json \
  --fee 500000
```

**Output:**
```
✅ Contract deployed!
Address: addr1q9z8k...  ← copy this
TX hash: tx1abc...
```

### 4. Configure Frontend

```bash
echo "VITE_CONTRACT_ADDRESS_PREPROD=addr1q9z8k..." >> .env
```

### 5. Build & Serve

```bash
npm run build
npm run preview
```

---

## Local Devnet

### 1. Start the Devnet Stack

```bash
docker compose -f devnet/docker-compose.yml up -d

# Wait for healthy status
docker compose -f devnet/docker-compose.yml ps
```

### 2. Deploy to Devnet

```bash
midnight deploy \
  --network devnet \
  --rpc http://localhost:9944 \
  --contract contract/dist/crime_report.midnight
```

### 3. Configure

```env
VITE_MIDNIGHT_NETWORK=devnet
VITE_CONTRACT_ADDRESS_DEVNET=<address>
VITE_PROOF_SERVER_URI=http://localhost:6300
```

---

## Vercel Frontend Hosting

### Option A: Via GitHub Actions (Automatic)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard → **Settings → Environment Variables**:
   ```env
   VITE_MIDNIGHT_NETWORK=preprod
   VITE_CONTRACT_ADDRESS_PREPROD=0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e
   ```
   > ⚠️ **Important**: Always use standard Vercel environment variables. Do NOT use deprecated Vercel CLI secrets (`@contract_address_preprod`), which will fail with secret reference errors.
3. If using the GitHub Actions deploy workflow, configure in GitHub → **Settings → Secrets**:
   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   CONTRACT_ADDRESS_PREPROD
   ```
4. Push to `main` — CI/CD pipeline deploys automatically.

### Option B: Manual CLI Deployment

```bash
npm install -g vercel

# First deploy (interactive setup)
vercel

# Subsequent deploys
vercel --prod

# With standard plaintext env vars (never use @secrets)
vercel --prod \
  -e VITE_MIDNIGHT_NETWORK=preprod \
  -e VITE_CONTRACT_ADDRESS_PREPROD=0200fd03c98cb6cccd46085adb1f1bfc68841d3725bd6cbecf0d265f94099a0e
```

### Fallback Support:
If `VITE_CONTRACT_ADDRESS_PREPROD` is omitted or not yet configured at build time, the frontend automatically falls back to:
```typescript
const contractAddress =
  import.meta.env.VITE_CONTRACT_ADDRESS_PREPROD ||
  "NOT_CONFIGURED";
```
The application builds cleanly and displays a user-friendly warning banner and toast notifications explaining that the contract is running in simulation mode until configured.

---

## Proof Server Setup

The proof server generates ZK proofs locally before submitting to the chain.

### Via Docker (Recommended)

```bash
docker run -d \
  --name midnight-proof-server \
  -p 6300:6300 \
  midnightnetwork/midnight-proof-server:latest
```

### Verify

```bash
curl http://localhost:6300/health
# {"status":"ok","version":"..."}
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_MIDNIGHT_NETWORK` | ✅ | `preprod` | Target network (`preprod` or `devnet`) |
| `VITE_CONTRACT_ADDRESS_PREPROD` | ⚠️ | `NOT_CONFIGURED` | Midnight preprod contract address (falls back to `NOT_CONFIGURED` with user notice) |
| `VITE_CONTRACT_ADDRESS_DEVNET` | ❌ | `02000000...` | Local devnet contract address |
| `VITE_PROOF_SERVER_URI` | ❌ | `http://localhost:6300` | Proof server endpoint |

> **Block Explorer Inspection**: To verify contract transactions on the testnet, visit [Midnight Testnet Explorer](https://testnet.midnightexplorer.com) and search for the contract address. Direct URLs without prior on-chain indexing may not resolve.
