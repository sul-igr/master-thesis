import { createConfig, http } from '@wagmi/vue'
import { anvil, localhost, mainnet, sepolia } from '@wagmi/vue/chains'
import { injected, metaMask } from '@wagmi/vue/connectors'

export const config = createConfig({
  chains: [anvil, localhost, mainnet, sepolia],
  connectors: [injected(), metaMask()],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [anvil.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http('https://cloudflare-eth.com'),
    [sepolia.id]: http('https://rpc.sepolia.org'),
  },
})
