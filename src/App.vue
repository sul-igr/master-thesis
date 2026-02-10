<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from './components/MainHeader.vue'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/vue'
import { anvil, arbitrum, mainnet, type AppKitNetwork } from '@reown/appkit/networks'

const projectId = 'e1437b0fb1674059c37d8a6e3808e4f0'

const metadata = {
  name: 'SubEth',
  description: 'EIP-7702 Recurring Payments',
  url: 'https://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [anvil, arbitrum, mainnet]

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
})
</script>

<template>
  <div class="app-container">
    <MainHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <!-- AppKit Modal -->
    <w3m-modal />
  </div>
</template>
