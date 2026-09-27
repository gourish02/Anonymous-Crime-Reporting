// ─────────────────────────────────────────────────────────────────────────────
// Network configurations for Midnight preprod & devnet
// ─────────────────────────────────────────────────────────────────────────────

import type { NetworkConfig } from '@/types'

export const NETWORKS: Record<string, NetworkConfig> = {
  preprod: {
    networkId: 'preprod',
    label: 'Preprod (Testnet)',
    indexerUri: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    proofServerUri: 'http://localhost:6300',
    rpcUri: 'https://rpc.testnet-02.midnight.network',
    explorerBaseUrl: 'https://explorer.testnet-02.midnight.network',
  },
  devnet: {
    networkId: 'devnet',
    label: 'Devnet (Local)',
    indexerUri: 'http://localhost:8088/api/v1/graphql',
    proofServerUri: 'http://localhost:6300',
    rpcUri: 'http://localhost:9944',
    explorerBaseUrl: 'http://localhost:8080',
  },
}

export const DEFAULT_NETWORK_ID =
  (import.meta.env.VITE_MIDNIGHT_NETWORK as string) ?? 'preprod'

export const getNetworkConfig = (id: string): NetworkConfig => {
  const cfg = NETWORKS[id]
  if (!cfg) throw new Error(`Unknown network: ${id}`)
  return cfg
}

// ── Fallback contract address support for Vercel & CI builds ──────────────────
export const contractAddress =
  import.meta.env.VITE_CONTRACT_ADDRESS_PREPROD ||
  "TEMP_CONTRACT_ADDRESS";

export const CONTRACT_ADDRESSES: Record<string, string | undefined> = {
  preprod: contractAddress,
  devnet: (import.meta.env.VITE_CONTRACT_ADDRESS_DEVNET as string | undefined) || contractAddress,
}

