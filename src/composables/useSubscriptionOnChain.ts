import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/core'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'

/** Struct returned by the delegate's getSubscription(id). */
export interface SubscriptionOnChain {
  token: `0x${string}`
  receiver: `0x${string}`
  amount: bigint
  interval: bigint
  nextExecutionTime: bigint
  endTime: bigint
  maxExecutions: number
  executionCount: number
  active: boolean
}

/**
 * Read subscription state from chain (delegate at accountAddress).
 * Source of truth for active/cancelled; call this instead of relying on DB.
 */
export const getSubscriptionOnChain = async (
  config: Config,
  accountAddress: `0x${string}`,
  chainId: number,
  subscriptionId: bigint,
): Promise<SubscriptionOnChain | null> => {
  const publicClient = getPublicClient(config, { chainId })
  if (!publicClient) return null
  try {
    const result = await publicClient.readContract({
      address: accountAddress,
      abi: SUBSCRIPTION_DELEGATE_ABI,
      functionName: 'getSubscription',
      args: [subscriptionId],
    })
    return result as SubscriptionOnChain
  } catch {
    return null
  }
}
