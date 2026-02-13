import { computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { readContract } from '@wagmi/core'
import { useAccount, useConfig, useSignTypedData } from '@wagmi/vue'
import { postApiSubscriptionsRelayCancel } from '@/api/generated/subscriptions/subscriptions'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'
import { queryKeys } from '@/api/query-keys'
import type { ApiErrorBody } from '@/api/types'

export const useUnsubscribe = () => {
  const config = useConfig()
  const queryClient = useQueryClient()
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()

  const mutation = useMutation({
    mutationFn: async ({
      onChainSubId,
      backendSubId,
    }: {
      onChainSubId: number
      backendSubId: number
    }): Promise<{ success: boolean; error?: string }> => {
      const userId = address.value
      if (!userId) {
        return { success: false, error: 'Wallet not connected' }
      }

      const cid = chainId.value
      if (!cid) {
        return { success: false, error: 'Wallet chain not set. Connect and try again.' }
      }

      const nonce = await readContract(config, {
        address: userId,
        abi: SUBSCRIPTION_DELEGATE_ABI,
        functionName: 'signatureNonce',
      })

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
      const body = res.data as unknown as ApiErrorBody | undefined
      const msg = body?.error ?? `Backend failed with status ${res.status}`
      return { success: false, error: msg }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      }
    },
  })

  const unsubscribe = async (
    onChainSubId: number,
    backendSubId: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      return await mutation.mutateAsync({ onChainSubId, backendSubId })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unsubscribe failed'
      return { success: false, error: msg }
    }
  }

  return {
    unsubscribe,
    loading: mutation.isPending,
    error: computed(() =>
      mutation.error != null ? String(mutation.error) : null,
    ),
  }
}
