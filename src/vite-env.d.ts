/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MIDNIGHT_NETWORK?: string
  readonly VITE_CONTRACT_ADDRESS_PREPROD?: string
  readonly VITE_CONTRACT_ADDRESS_DEVNET?: string
  readonly VITE_PROOF_SERVER_URI?: string
  readonly VITE_INDEXER_URI_PREPROD?: string
  readonly VITE_INDEXER_URI_DEVNET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
