import { ref } from 'vue'
import { readContract } from '@wagmi/core'
import { useAccount, useConfig, useSignTypedData } from '@wagmi/vue'
import { postApiSubscriptionsRelayCancel } from '@/api/generated/subscriptions/subscriptions'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'

export function useUnsubscribe() {
  const config = useConfig()
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
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

    const cid = chainId.value
    if (!cid) {
      return { success: false, error: 'Wallet chain not set. Connect and try again.' }
    }

    loading.value = true
    error.value = null
    try {
      // Read the current signature nonce from the user's delegated EOA
      const nonce = await readContract(config, {
        address: userId,
        abi: SUBSCRIPTION_DELEGATE_ABI,
        functionName: 'signatureNonce',
      })

      // Sign EIP-712 typed data (no gas required)
      const signature = await signTypedDataAsync({
        domain: {
          name: 'SubscriptionDelegate',
          version: '1',
          chainId: cid,
          verifyingContract: userId,
        },
        types: {
          CancelSubscription: [
            { name: 'subscriptionId', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
          ],
        },
        primaryType: 'CancelSubscription',
        message: {
          subscriptionId: BigInt(onChainSubId),
          nonce,
        },
      })

      // Post to backend relay endpoint — relayer pays gas
      const res = await postApiSubscriptionsRelayCancel({
        userId,
        backendSubId,
        onChainSubId: String(onChainSubId),
        nonce: nonce.toString(),
        signature,
      })

      if (res.status >= 200 && res.status < 300) {
        return { success: true }
      }
      const body = res.data as any
      const msg = body?.error ?? `Backend failed with status ${res.status}`
      return { success: false, error: msg }
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
