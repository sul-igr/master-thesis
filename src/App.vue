<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useAccount } from '@wagmi/vue'
import MainHeader from './components/MainHeader.vue'
// Import wagmi config to ensure AppKit is initialized before the app renders
import '@/config/wagmi'

const router = useRouter()
const { address } = useAccount()

// When the user switches wallet address (e.g. in Rabby), reset to home.
// The router guard will then re-check delegation status.
watch(address, (newAddr, oldAddr) => {
  if (oldAddr && newAddr !== oldAddr) {
    router.replace({ name: 'home' })
  }
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
