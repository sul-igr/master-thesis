<template>
  <div v-if="!isConnected" class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-primary">Connect Your Wallet</h2>
        <p class="mt-2 text-sm text-secondary">Connect your wallet to get started</p>
      </div>

      <div class="mt-8">
        <LoginButton />
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="max-w-4xl w-full space-y-8 p-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-primary">Dashboard</h2>
        <p class="mt-2 text-sm text-secondary">Welcome back!</p>
      </div>

      <div class="mt-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Wallet Info</h3>
          <p class="text-sm text-gray-600 mb-2">
            Connected: {{ address?.slice(0, 6) }}...{{ address?.slice(-4) }}
          </p>
          <BaseButton @click="disconnectWallet" variant="outline"> Disconnect Wallet </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import LoginButton from '@/components/LoginButton.vue'
import BaseButton from '@/components/BaseButton.vue'

const { isConnected, address, disconnectWallet } = useWallet()
</script>
