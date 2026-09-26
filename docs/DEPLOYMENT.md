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

1. Connect your GitHub repo to Vercel
2. Set secrets in GitHub → Settings → Secrets:
   ```
   VERCEL_TOKEN
   VERCEL_ORG_ID
   VERCEL_PROJECT_ID
   CONTRACT_ADDRESS_PREPROD
   ```
3. Push to `main` — CI/CD pipeline deploys automatically

### Option B: Manual CLI Deployment

```bash
npm install -g vercel

# First deploy (interactive setup)
vercel

# Subsequent deploys
vercel --prod

# With env vars
vercel --prod \
  -e VITE_MIDNIGHT_NETWORK=preprod \
  -e VITE_CONTRACT_ADDRESS_PREPROD=<address>
```

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
| `VITE_MIDNIGHT_NETWORK` | ✅ | `preprod` | Target network |
| `VITE_CONTRACT_ADDRESS_PREPROD` | ✅* | — | Deployed contract on preprod |
| `VITE_CONTRACT_ADDRESS_DEVNET` | ✅* | — | Deployed contract on devnet |
| `VITE_PROOF_SERVER_URI` | ❌ | `http://localhost:6300` | Proof server endpoint |

*At least one contract address is required depending on the target network.
