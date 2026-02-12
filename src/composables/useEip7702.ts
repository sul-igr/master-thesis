import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/core'
import { useAccount, useConfig } from '@wagmi/vue'
import { ACCOUNT_IMPLEMENTATION_ADDRESS } from '@/constants'

/** Call from router guard etc. – does not rely on Vue injection */
export const checkIsDelegated = async (
  config: Config,
  address: `0x${string}`,
  chainId: number,
): Promise<boolean> => {
  const publicClient = getPublicClient(config, { chainId })
  if (!publicClient) return false
  const code = await publicClient.getCode({ address })
  if (!code) return false
  const delegatedAddress = ('0x' + code.slice(8)) as `0x${string}`
  return delegatedAddress.toLowerCase() === ACCOUNT_IMPLEMENTATION_ADDRESS.toLowerCase()
}

export const useEIP7702 = () => {
  const config = useConfig()
  const accountImplementation = ACCOUNT_IMPLEMENTATION_ADDRESS as `0x${string}`
  const { address, chainId } = useAccount()

  const getCode = async (): Promise<`0x${string}` | undefined> => {
    if (!address.value || !chainId.value) {
      throw new Error('Wallet not connected')
    }
    const publicClient = getPublicClient(config, { chainId: chainId.value })
    if (!publicClient) {
      throw new Error(`No RPC configured for chain ${chainId.value}`)
    }
    return publicClient.getCode({ address: address.value })
  }

  const isDelegated = async (): Promise<boolean> => {
    const code = await getCode()
    if (!code) return false
    const delegatedAddress = '0x' + code.slice(8)
    return delegatedAddress.toLowerCase() === accountImplementation.toLowerCase()
  }

  return {
    getCode,
    isDelegated,
  }
}
