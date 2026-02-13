<template>
  <div class="my-subscriptions">
    <h1>My Subscriptions</h1>

    <p v-if="loading" class="status-text">Loading subscriptions...</p>
    <p v-else-if="error" class="status-text">{{ error }}</p>
    <p v-else-if="subscriptions.length === 0" class="status-text">No subscriptions yet.</p>

    <div v-else class="subscription-list">
      <div
        v-for="sub in subscriptions"
        :key="sub.id"
        class="subscription-item"
      >
        <div class="sub-header">
          <h3>{{ sub.plan?.name ?? 'Unknown plan' }}</h3>
          <span class="status-badge" :class="statusBadgeClass(sub)">
            {{ statusBadgeLabel(sub) }}
          </span>
        </div>

        <div class="sub-details">
          <div class="detail-row">
            <span class="label">Price</span>
            <span>{{ displayPrice(sub) }} {{ sub.plan?.tokenSymbol ?? '' }}</span>
          </div>
          <div v-if="sub.nextExecutionTime" class="detail-row">
            <span class="label">Next payment</span>
            <span>{{ formatDate(sub.nextExecutionTime) }}</span>
          </div>
          <div v-if="sub.executionCount != null" class="detail-row">
            <span class="label">Payments made</span>
            <span>{{ sub.executionCount }}</span>
          </div>
        </div>

        <div class="sub-actions">
          <button
            v-if="sub.isOverdue"
            class="retry-btn"
            :disabled="retryingIds.has(sub.id)"
            @click="handleRetry(sub)"
          >
            {{ retryingIds.has(sub.id) ? 'Retrying...' : 'Retry payment' }}
          </button>
          <button
            v-if="sub.onChainActive && sub.onChainSubscriptionId != null"
            class="unsubscribe-btn"
            :disabled="unsubLoading"
            @click="handleUnsubscribe(sub)"
          >
            {{ unsubLoading ? 'Cancelling...' : 'Unsubscribe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { postApiSubscriptionsIdRetry } from '@/api/generated/subscriptions/subscriptions'
import { queryKeys } from '@/api/query-keys'
import {
  useSubscriptionsQuery,
  type EnrichedSubscription,
} from '@/composables/useSubscriptionsQuery'
import { useUnsubscribe } from '@/composables/useUnsubscribe'
import { formatPrice } from '@/utils/format'
import { useAccount } from '@wagmi/vue'

const queryClient = useQueryClient()
const { address } = useAccount()
const { unsubscribe, loading: unsubLoading } = useUnsubscribe()

const { data: subscriptionsList, isLoading: loading, error: queryError } = useSubscriptionsQuery()
const subscriptions = computed(() => subscriptionsList.value ?? [])
const error = computed(() => {
  if (!address.value) return 'Wallet not connected'
  return queryError.value ? (queryError.value as Error).message : null
})

const retryingIds = reactive(new Set<number>())
const retryMutation = useMutation({
  mutationFn: async ({ subId, userId }: { subId: number; userId: string }) => {
    return postApiSubscriptionsIdRetry(subId, { userId })
  },
  onSuccess: (res) => {
    if (res.status >= 200 && res.status < 300) {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
    }
  },
})

// --- Helpers ---

const displayPrice = (sub: EnrichedSubscription): string => {
  if (!sub.plan?.price) return '—'
  return formatPrice(sub.plan.price, sub.plan.tokenDecimals ?? 18)
}

const formatDate = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleString()

const statusBadgeClass = (sub: EnrichedSubscription): string => {
  if (sub.isOverdue) return 'overdue'
  return sub.onChainActive ? 'active' : 'cancelled'
}

const statusBadgeLabel = (sub: EnrichedSubscription): string => {
  if (sub.isOverdue) return 'Payment overdue'
  return sub.onChainActive ? 'Active' : 'Cancelled'
}

// --- Actions ---

const handleUnsubscribe = async (sub: EnrichedSubscription) => {
  if (sub.onChainSubscriptionId == null) return
  const { success, error: err } = await unsubscribe(sub.onChainSubscriptionId, sub.id)
  if (success) {
    sub.onChainActive = false
  } else {
    console.error('Unsubscribe failed:', err)
  }
}

const handleRetry = async (sub: EnrichedSubscription) => {
  const userId = address.value
  if (!userId) return
  retryingIds.add(sub.id)
  try {
    await retryMutation.mutateAsync({ subId: sub.id, userId })
  } catch (e) {
    console.error('Retry failed:', e)
  } finally {
    retryingIds.delete(sub.id)
  }
}
</script>

<style scoped>
.my-subscriptions {
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem 0;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: var(--color-text-primary, #fff);
}

.status-text {
  color: var(--color-text-secondary, #9ca3af);
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subscription-item {
  background: var(--color-bg-card, #1a1a2e);
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 12px;
  padding: 1.25rem;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sub-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary, #fff);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-badge.overdue {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.sub-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-primary, #fff);
  font-size: 0.875rem;
}

.label {
  color: var(--color-text-secondary, #9ca3af);
}

.sub-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.retry-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 8px;
  background: transparent;
  color: #f59e0b;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover:not(:disabled) {
  background-color: rgba(245, 158, 11, 0.15);
}

.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unsubscribe-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.unsubscribe-btn:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.15);
}

.unsubscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
