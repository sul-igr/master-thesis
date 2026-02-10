import { encodeFunctionData } from 'viem'
import { ref } from 'vue'
import { getPublicClient } from '@wagmi/core'
import { useAccount, useConfig, useSendTransaction } from '@wagmi/vue'
import { postApiSubscriptionsIdCancel } from '@/api/generated/subscriptions/subscriptions'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'

export function useUnsubscribe() {
  const config = useConfig()
  const { address, chainId } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function unsubscribe(
    onChainSubId: number,
    backendSubId: number,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = address.value
    if (!userId) {
      return { success: false, error: 'Wallet not connected' }
    }

    const data = encodeFunctionData({
      abi: SUBSCRIPTION_DELEGATE_ABI,
      functionName: 'cancelSubscription',
      args: [BigInt(onChainSubId)],
    })

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

      const cid = chainId.value
      if (cid) {
        const publicClient = getPublicClient(config, { chainId: cid })
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash })
        }
      }

      await postApiSubscriptionsIdCancel(backendSubId)
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unsubscribe failed'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  return { unsubscribe, loading, error }
}
