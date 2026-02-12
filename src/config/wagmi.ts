import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/vue'
import { anvil, holesky, mainnet, sepolia, type AppKitNetwork } from '@reown/appkit/networks'
import { http } from '@wagmi/vue'
import { getRpcUrl } from '@/constants'

const projectId = 'e1437b0fb1674059c37d8a6e3808e4f0'

const metadata = {
  name: 'SubEth',
  description: 'EIP-7702 Recurring Payments',
  url: 'https://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [anvil, sepolia, holesky, mainnet]

// Single WagmiAdapter — source of truth for both AppKit and WagmiPlugin
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [anvil.id]: http(getRpcUrl(anvil.id)),
    [sepolia.id]: http(getRpcUrl(sepolia.id)),
    [holesky.id]: http(getRpcUrl(holesky.id)),
    [mainnet.id]: http(getRpcUrl(mainnet.id)),
  },
})

// Create AppKit once — social login, WalletConnect, injected wallets all go through this
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'apple', 'facebook', 'farcaster'],
  },
})

// This is the wagmi config that WagmiPlugin and useConfig() should use
export const config = wagmiAdapter.wagmiConfig
