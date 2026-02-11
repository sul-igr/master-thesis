<template>
  <div v-if="!isConnected" class="landing">
    <div class="landing-card">
      <div class="landing-badge">EIP-7702 Powered</div>

      <h1 class="landing-title">SubEth</h1>
      <p class="landing-subtitle">
        On-chain recurring payments, straight from your wallet.
        No approvals, no intermediaries.
      </p>

      <div class="landing-features">
        <div class="feature">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div class="feature-label">Gasless</div>
            <div class="feature-desc">Relayer pays gas on your behalf</div>
          </div>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div class="feature-label">Automated</div>
            <div class="feature-desc">Payments execute on schedule</div>
          </div>
        </div>
        <div class="feature">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <div class="feature-label">Self-Custody</div>
            <div class="feature-desc">Funds stay in your wallet until due</div>
          </div>
        </div>
      </div>

      <LoginButton />
    </div>
  </div>

  <div v-else-if="delegated === null" class="landing">
    <p class="loading-text">Checking delegation status...</p>
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

<style scoped>
.landing {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.landing-card {
  width: 100%;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2.5rem 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    0 0 80px rgba(25, 25, 230, 0.08);
}

.landing-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-bg-secondary);
  background: rgba(25, 25, 230, 0.12);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-full);
  border: 1px solid rgba(25, 25, 230, 0.25);
}

.landing-title {
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.landing-subtitle {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 22rem;
}

.landing-features {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feature-icon {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  background: var(--color-bg-content);
  color: var(--color-bg-secondary);
}

.feature-label {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: 1.3;
}

.feature-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.loading-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
