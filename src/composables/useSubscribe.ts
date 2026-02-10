import { encodeFunctionData } from 'viem'
import { ref } from 'vue'
import { getPublicClient, readContract } from '@wagmi/core'
import { useAccount, useConfig, useSendTransaction } from '@wagmi/vue'
import { postApiSubscriptions } from '@/api/generated/subscriptions/subscriptions'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'
import { checkIsDelegated } from '@/composables/useEip7702'
import type { Plan } from '@/api/types'

export function useSubscribe() {
  const config = useConfig()
  const { address, chainId } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function subscribe(plan: Plan): Promise<{ success: boolean; error?: string }> {
    const userId = address.value
    if (!userId) {
      return { success: false, error: 'Wallet not connected' }
    }
    const token = plan.token as `0x${string}` | undefined
    const receiver = plan.receiver as `0x${string}` | undefined
    const intervalSeconds = plan.intervalSeconds
    if (!token || !receiver || intervalSeconds == null || intervalSeconds <= 0) {
      return {
        success: false,
        error:
          'Plan missing token, receiver, or intervalSeconds (required for on-chain subscription)',
      }
    }
    // plan.price is already in base units (uint256 string, e.g. "1000000000000000000")
    const amount = BigInt(plan.price)
    const interval = BigInt(intervalSeconds)
    const startTime = 0n
    const endTime = 0n
    const maxExecutions = 0

    const data = encodeFunctionData({
      abi: SUBSCRIPTION_DELEGATE_ABI,
      functionName: 'createSubscription',
      args: [token, receiver, amount, interval, startTime, endTime, maxExecutions],
    })

    const cid = chainId.value
    if (!cid) {
      return { success: false, error: 'Wallet chain not set. Connect and try again.' }
    }
    const delegated = await checkIsDelegated(config, userId, cid)
    if (!delegated) {
      return {
        success: false,
        error: `Not delegated on this chain (${cid}). Switch your wallet to the chain you delegated on (e.g. Anvil 31337 / localhost 1337), or delegate there first.`,
      }
    }

    loading.value = true
    error.value = null
    try {
      const hash = await sendTransactionAsync({
        to: userId,
        data,
        value: 0n,
      })
      if (!hash) {
        return { success: false, error: 'Transaction failed' }
      }
      const publicClient = getPublicClient(config, { chainId: cid })
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash })
      }

      // Read the on-chain subscription count to get the ID of the just-created subscription
      const subCount = await readContract(config, {
        address: userId,
        abi: SUBSCRIPTION_DELEGATE_ABI,
        functionName: 'subscriptionCount',
      })
      const onChainSubscriptionId = Number(subCount)

      const res = await postApiSubscriptions({
        userId,
        planId: plan.id,
        onChainSubscriptionId,
      } as any)
      if (res.status >= 200 && res.status < 300) {
        return { success: true }
      }
      const body = res.data as { message?: string } | undefined
      const msg = body?.message ?? `Backend failed with status ${res.status}`
      return { success: false, error: msg }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Subscribe failed'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  return { subscribe, loading, error, address }
}
