import router from '@/router'
import { useAccount, useDisconnect } from '@wagmi/vue'
import { useAppKit } from '@reown/appkit/vue'

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  const connectWallet = async () => {
    try {
      open()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = () => {
    disconnect()
    router.push({ name: 'home' })
  }

  return {
    isConnected,
    isConnecting,
    address,
    connectWallet,
    disconnectWallet,
  }
}
