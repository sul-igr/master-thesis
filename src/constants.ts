/** EIP-7702 account implementation contract address (used for delegation) */
// export const ACCOUNT_IMPLEMENTATION_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const
export const ACCOUNT_IMPLEMENTATION_ADDRESS = '0xec6f2945A927C9D1E3Ea11e0Bf39E6c1acFBcc76' as const
/** Backend API base URL (used by manually-written API helpers and orval mutator) */
export const API_BASE_URL = 'https://thesis-be-p2x2.onrender.com' as const

/** API base URL at runtime (env override: VITE_API_BASE_URL for deploy) */
export function getApiBaseUrl(): string {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env
  return env.VITE_API_BASE_URL ?? API_BASE_URL
}

const SEPOLIA_ID = 11155111
const HOLESKY_ID = 17000
const MAINNET_ID = 1
const ANVIL_IDS = [31337, 1337]

const defaultRpcUrls: Record<number, string> = {
  [MAINNET_ID]: 'https://cloudflare-eth.com',
  [SEPOLIA_ID]: 'https://rpc.sepolia.org',
  [HOLESKY_ID]: 'https://holesky.drpc.org',
  [ANVIL_IDS[0]]: 'http://127.0.0.1:8545',
  [ANVIL_IDS[1]]: 'http://127.0.0.1:8545',
}

/** RPC URL for a chain (env overrides: VITE_RPC_URL_SEPOLIA, VITE_RPC_URL_HOLESKY, VITE_RPC_URL_MAINNET) */
export function getRpcUrl(chainId: number): string {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env
  if (chainId === SEPOLIA_ID && env.VITE_RPC_URL_SEPOLIA) return env.VITE_RPC_URL_SEPOLIA
  if (chainId === HOLESKY_ID && env.VITE_RPC_URL_HOLESKY) return env.VITE_RPC_URL_HOLESKY
  if (chainId === MAINNET_ID && env.VITE_RPC_URL_MAINNET) return env.VITE_RPC_URL_MAINNET
  if (ANVIL_IDS.includes(chainId)) return defaultRpcUrls[chainId] ?? 'http://127.0.0.1:8545'
  return defaultRpcUrls[chainId] ?? 'https://cloudflare-eth.com'
}
