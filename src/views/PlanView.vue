<template>
  <div class="plan-view">
    <RouterLink to="/" class="back-link">
      <ArrowLeft :size="18" />
      Back to plans
    </RouterLink>

    <p v-if="loading" class="status-text">Loading...</p>

    <template v-else-if="plan">
      <div class="plan-card">
        <div class="plan-hero">
          <img
            :src="plan.imageUrl ?? DEFAULT_IMAGE"
            :alt="plan.name"
            class="hero-image"
          />
          <div class="hero-overlay" />
        </div>

        <div class="plan-body">
          <div class="plan-name-row">
            <h1 class="plan-name">{{ plan.name }}</h1>
            <RouterLink
              v-if="isCreator"
              :to="{ name: 'edit-plan', params: { id: plan.id } }"
              class="edit-plan-link"
            >
              <Pencil :size="16" /> Edit Plan
            </RouterLink>
          </div>

          <div class="pricing-row">
            <div class="price-block">
              <span class="price-amount">{{ displayPrice }}</span>
              <span class="price-token">{{ plan.tokenSymbol ?? '' }}</span>
            </div>
            <span class="price-interval">/ {{ displayInterval }}</span>
          </div>

          <p v-if="plan.description" class="plan-description">
            {{ plan.description }}
          </p>

          <div class="plan-meta">
            <div class="meta-item">
              <span class="meta-label">Token</span>
              <span class="meta-value">{{ plan.tokenSymbol ?? 'ERC-20' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Billing cycle</span>
              <span class="meta-value">{{ displayInterval }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Chain</span>
              <span class="meta-value">{{ chainName }}</span>
            </div>
          </div>

          <BaseButton
            class="subscribe-cta"
            @click="handleSubscribe"
            :disabled="subscribeDisabled"
          >
            {{ subscribeButtonText }}
          </BaseButton>
        </div>
      </div>
    </template>

    <template v-else>
      <p class="status-text">Plan not found.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Pencil } from 'lucide-vue-next'
import BaseButton from '@/components/BaseButton.vue'
import { getApiPlans } from '@/api/generated/plans/plans'
import type { Plan } from '@/api/types'
import { useSubscribe } from '@/composables/useSubscribe'
import { useWallet } from '@/composables/useWallet'
import { formatPrice, formatInterval } from '@/utils/format'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&crop=center'

const route = useRoute()
const router = useRouter()
const plan = ref<Plan | null>(null)
const loading = ref(true)
const { address, isConnected } = useWallet()
const { subscribe, loading: subscribing } = useSubscribe()

const slug = computed(() => route.params.slug as string)

const displayPrice = computed(() => {
  if (!plan.value) return ''
  return formatPrice(plan.value.price, plan.value.tokenDecimals ?? 18)
})

const displayInterval = computed(() => {
  if (!plan.value) return ''
  return formatInterval(plan.value.intervalSeconds)
})

const isCreator = computed(() => {
  if (!plan.value || !address.value) return false
  return plan.value.creator?.toLowerCase() === address.value.toLowerCase()
})

const chainName = computed(() => {
  if (!plan.value) return ''
  const map: Record<number, string> = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    11155111: 'Sepolia',
    17000: 'Holesky',
    31337: 'Local (Anvil)',
  }
  return map[plan.value.chainId ?? 0] ?? `Chain ${plan.value.chainId}`
})

const loadPlan = async () => {
  try {
    const listRes = await getApiPlans()
    const list = (listRes.data as Plan[] | undefined) ?? []
    plan.value = Array.isArray(list)
      ? list.find((p: Plan) => p.slug === slug.value || p.id === slug.value) ?? null
      : null
  } catch {
    plan.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadPlan)

const subscribeButtonText = computed(() => {
  if (subscribing.value) return 'Subscribing...'
  if (!isConnected.value) return 'Connect wallet to subscribe'
  return 'Subscribe'
})
const subscribeDisabled = computed(() => !plan.value || !address.value || subscribing.value)

const handleSubscribe = async () => {
  if (!address.value || !plan.value) return
  const { success, error } = await subscribe(plan.value)
  if (success) {
    router.push({ name: 'my-subscriptions' })
  } else {
    console.error('Subscribe failed:', error)
  }
}
</script>

<style scoped>
.plan-view {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary, #9ca3af);
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-text-primary, #fff);
}

.status-text {
  color: var(--color-text-secondary, #9ca3af);
}

.plan-card {
  background: var(--color-bg-card, #1a1a2e);
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 16px;
  overflow: hidden;
}

.plan-hero {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(transparent, var(--color-bg-card, #1a1a2e));
}

.plan-body {
  padding: 1.5rem 2rem 2rem;
}

.plan-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.plan-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin: 0;
}

.edit-plan-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.edit-plan-link:hover {
  background-color: rgba(59, 130, 246, 0.15);
}

.pricing-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 1.25rem;
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
}

.price-token {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-secondary, #9ca3af);
}

.price-interval {
  font-size: 1rem;
  color: var(--color-text-secondary, #9ca3af);
}

.plan-description {
  color: var(--color-text-secondary, #9ca3af);
  line-height: 1.7;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.plan-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border, #2d2d44);
  border-bottom: 1px solid var(--color-border, #2d2d44);
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary, #9ca3af);
}

.meta-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary, #fff);
}

.subscribe-cta {
  width: 100%;
}
</style>
