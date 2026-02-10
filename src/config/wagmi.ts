import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/vue'
import { anvil, arbitrum, mainnet, type AppKitNetwork } from '@reown/appkit/networks'
import { http } from '@wagmi/vue'

const projectId = 'e1437b0fb1674059c37d8a6e3808e4f0'

const metadata = {
  name: 'SubEth',
  description: 'EIP-7702 Recurring Payments',
  url: 'https://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [anvil, arbitrum, mainnet]

// Single WagmiAdapter — source of truth for both AppKit and WagmiPlugin
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
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
