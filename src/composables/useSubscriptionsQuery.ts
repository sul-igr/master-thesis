import type { Config } from '@wagmi/core'
import { useQuery } from '@tanstack/vue-query'
import { useAccount, useConfig } from '@wagmi/vue'
import { getApiSubscriptionsUserUserId } from '@/api/generated/subscriptions/subscriptions'
import { queryKeys } from '@/api/query-keys'
import { getSubscriptionOnChain } from '@/composables/useSubscriptionOnChain'
import type { Subscription } from '@/api/types'

export interface EnrichedSubscription extends Subscription {
  onChainActive: boolean
  nextExecutionTime: number | null
  executionCount: number | null
  isOverdue: boolean
}

async function enrichSubscription(
  config: Config,
  sub: Subscription,
  userId: `0x${string}`,
  chainId: number | undefined,
): Promise<EnrichedSubscription> {
  let onChainActive = sub.status === 'active' && !sub.cancelled
  let nextExecutionTime: number | null = null
  let executionCount: number | null = null

  if (sub.onChainSubscriptionId != null && chainId) {
    const onChain = await getSubscriptionOnChain(
      config,
      userId,
      chainId,
      BigInt(sub.onChainSubscriptionId),
    )
    if (onChain) {
      onChainActive = onChain.active
      nextExecutionTime = Number(onChain.nextExecutionTime)
      executionCount = onChain.executionCount
    }
  }

  const isOverdue =
    onChainActive &&
    nextExecutionTime != null &&
    nextExecutionTime <= Date.now() / 1000

  return { ...sub, onChainActive, nextExecutionTime, executionCount, isOverdue }
}

export function useSubscriptionsQuery() {
  const config = useConfig()
  const { address, chainId } = useAccount()

  return useQuery({
    queryKey: queryKeys.subscriptions.list(
      address.value ?? '',
      chainId.value ?? undefined,
    ),
    queryFn: async (): Promise<EnrichedSubscription[]> => {
      const userId = address.value
      if (!userId) return []

      const res = await getApiSubscriptionsUserUserId(userId)
      const data = res.data as Subscription[] | undefined
      if (!Array.isArray(data)) return []

      return Promise.all(
        data.map((sub) =>
          enrichSubscription(config, sub, userId as `0x${string}`, chainId.value ?? undefined),
        ),
      )
    },
    enabled: !!address.value,
  })
}
