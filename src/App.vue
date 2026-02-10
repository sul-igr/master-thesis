<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainHeader from './components/MainHeader.vue'
// Import wagmi config to ensure AppKit is initialized before the app renders
import '@/config/wagmi'
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
