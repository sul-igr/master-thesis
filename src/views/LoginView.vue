<template>
  <div class="min-h-screen flex items-center justify-center">
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
</template>

<script setup lang="ts">
import LoginButton from '@/components/LoginButton.vue'
</script>
