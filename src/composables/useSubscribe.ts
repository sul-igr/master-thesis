import { ref } from 'vue'
import { readContract } from '@wagmi/core'
import { useAccount, useConfig, useSignTypedData } from '@wagmi/vue'
import { postApiSubscriptionsRelayCreate } from '@/api/generated/subscriptions/subscriptions'
import { SUBSCRIPTION_DELEGATE_ABI } from '@/abis/subscriptionDelegate'
import { checkIsDelegated } from '@/composables/useEip7702'
import type { Plan, ApiErrorBody } from '@/api/types'

export const useSubscribe = () => {
  const config = useConfig()
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const subscribe = async (plan: Plan): Promise<{ success: boolean; error?: string }> => {
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
          CreateSubscription: [
            { name: 'token', type: 'address' },
            { name: 'receiver', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'interval', type: 'uint64' },
            { name: 'startTime', type: 'uint64' },
            { name: 'endTime', type: 'uint64' },
            { name: 'maxExecutions', type: 'uint32' },
            { name: 'nonce', type: 'uint256' },
          ],
        },
        primaryType: 'CreateSubscription',
        message: {
          token,
          receiver,
          amount,
          interval,
          startTime,
          endTime,
          maxExecutions,
          nonce,
        },
      })

      // Post to backend relay endpoint — relayer pays gas
      const res = await postApiSubscriptionsRelayCreate({
        userId,
        planId: plan.id,
        token,
        receiver,
        amount: amount.toString(),
        interval: interval.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        maxExecutions: String(maxExecutions),
        nonce: nonce.toString(),
        signature,
      })

      if (res.status >= 200 && res.status < 300) {
        return { success: true }
      }
      const body = res.data as unknown as ApiErrorBody | undefined
      const msg = body?.error ?? `Backend failed with status ${res.status}`
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
