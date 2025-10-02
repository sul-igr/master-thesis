<template>
  <div class="flex flex-col gap-4">
    <BaseButton v-if="!isConnected" @click="connectWallet" :disabled="isConnecting" class="w-full">
      {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
    </BaseButton>

    <div v-else class="flex flex-col gap-2">
      <div class="text-sm text-gray-600">
        Connected: {{ address?.slice(0, 6) }}...{{ address?.slice(-4) }}
      </div>
      <BaseButton @click="disconnectWallet" variant="outline" class="w-full">
        Disconnect
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import { useWallet } from '@/composables/useWallet'

const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWallet()
</script>
