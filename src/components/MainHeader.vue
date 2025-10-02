<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink v-if="isConnected" to="/dashboard">Dashboard</RouterLink>
        <button v-if="isConnected" @click="disconnectWallet">Disconnect</button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWallet } from '@/composables/useWallet'

const { isConnected, disconnectWallet } = useWallet()
</script>
