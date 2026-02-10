<template>
  <header>
    <div class="wrapper">
      <RouterLink to="/" class="logo">SubEth</RouterLink>

      <nav v-if="showAppNav" class="nav-center">
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/my-subscriptions">My Subscriptions</RouterLink>
        <RouterLink to="/create-plan">Create Plan</RouterLink>
      </nav>

      <div v-if="showAppNav" class="nav-right">
        <button class="icon-button" title="Disconnect wallet" @click="disconnectWallet">
          <LogOut :size="16" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useWallet } from '@/composables/useWallet'
import { useEIP7702 } from '@/composables/useEip7702'
import { LogOut } from 'lucide-vue-next'

const { isConnected, disconnectWallet } = useWallet()
const { isDelegated } = useEIP7702()
const route = useRoute()
const delegated = ref(false)

watch(
  [isConnected, () => route.name],
  async () => {
    if (!isConnected.value) {
      delegated.value = false
      return
    }
    delegated.value = await isDelegated()
  },
  { immediate: true }
)

const appRouteNames = ['home', 'create-plan', 'plan', 'my-subscriptions']
const showAppNav = computed(
  () =>
    isConnected.value &&
    (appRouteNames.includes(route.name as string) || delegated.value)
)
</script>

<style scoped>
header {
  position: relative;
}

header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  width: 99vw;
  margin-left: calc(-50vw + 50%);
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.logo {
  flex: 0 0 auto;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  text-decoration: none;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.25rem;
}

.nav-right {
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: var(--color-text-secondary, #9ca3af);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: color 0.2s, background-color 0.2s;
}

nav a:hover,
nav a.router-link-active {
  color: var(--color-text-primary, #fff);
  background-color: rgba(255, 255, 255, 0.06);
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--color-text-secondary, #9ca3af);
}

.icon-button:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary, #fff);
}
</style>
