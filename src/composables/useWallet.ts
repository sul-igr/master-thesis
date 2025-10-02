import { useAccount, useConnect, useDisconnect } from '@wagmi/vue'

export const useWallet = () => {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const connectWallet = async () => {
    try {
      await connect({ connector: connectors[0] })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  return {
    isConnected,
    address,
    isConnecting: isPending,
    connectWallet,
    disconnectWallet,
  }
}
