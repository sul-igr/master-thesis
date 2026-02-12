/**
 * Plan as returned by GET /api/plans and GET /api/plans/:id.
 * Keep in sync with backend response shape (openapi has no response schema for these).
 * token, receiver, intervalSeconds, tokenDecimals are required for on-chain createSubscription.
 */
export interface Plan {
  id: string
  name: string
  description?: string
  price: string
  imageUrl?: string
  slug?: string
  active?: boolean
  /** Chain ID the plan lives on */
  chainId?: number
  /** ERC-20 token address (required for subscribe) */
  token?: string
  /** Payment recipient address (required for subscribe) */
  receiver?: string
  /** Seconds between payments (required for subscribe) */
  intervalSeconds?: number
  /** Token decimals for amount conversion (default 18) */
  tokenDecimals?: number
  /** Creator/merchant wallet address */
  creator?: string
  /** Token symbol (e.g. "USDC") */
  tokenSymbol?: string
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due'

/**
 * User subscription from GET /api/subscriptions/user/:userId.
 * active from chain (getSubscription) overrides DB; onChainSubscriptionId required for chain read.
 */
export interface Subscription {
  id: number
  userId: string
  planId: string
  status: SubscriptionStatus
  /** On-chain subscription id (uint256 from createSubscription). Required to read on-chain data. */
  onChainSubscriptionId?: number | null
  nextPaymentDate?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  cancelled: boolean
  lastPaymentTxHash?: string | null
  failedRetries?: number
  lastFailedAt?: string | null
  plan?: Plan
}

/** Shape returned by the backend on error responses (4xx/5xx). */
export interface ApiErrorBody {
  error?: string
}
