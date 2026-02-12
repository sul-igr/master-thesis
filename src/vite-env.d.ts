/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL_SEPOLIA?: string
  readonly VITE_RPC_URL_HOLESKY?: string
  readonly VITE_RPC_URL_MAINNET?: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
