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

  <div v-else-if="delegated === null" class="min-h-screen flex items-center justify-center">
    <p class="text-secondary">Checking…</p>
  </div>

  <DashboardView v-else />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '@/composables/useWallet'
import { useEIP7702 } from '@/composables/useEip7702'
import LoginButton from '@/components/LoginButton.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = useRouter()
const { isConnected } = useWallet()
const { isDelegated } = useEIP7702()
const delegated = ref<boolean | null>(null)

watch(
  isConnected,
  async (connected) => {
    if (!connected) {
      delegated.value = null
      return
    }
    const result = await isDelegated()
    delegated.value = result
    if (!result) router.replace({ name: 'delegate' })
  },
  { immediate: true }
)
</script>
