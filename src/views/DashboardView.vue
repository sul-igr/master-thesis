<template>
  <div class="dashboard">
    <h1 class="dashboard-title">Plans</h1>

    <p v-if="loading" class="status-text">Loading plans...</p>
    <p v-else-if="plans.length === 0" class="status-text">No plans available yet.</p>

    <div v-else class="plans-grid">
      <SubscriptionCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        :showEdit="isAdmin && isOwnPlan(plan)"
        :showDelete="isAdmin && isOwnPlan(plan)"
        @edit="handleEdit(plan)"
        @delete="handleDelete(plan)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSignMessage } from '@wagmi/vue'
import SubscriptionCard from '@/components/SubscriptionCard.vue'
import type { Plan } from '@/api/types'
import { useAdmin } from '@/composables/useAdmin'
import { useDeletePlanMutation } from '@/composables/usePlanMutations'
import { usePlansQuery } from '@/composables/usePlansQuery'
import { useWallet } from '@/composables/useWallet'

const router = useRouter()
const { address } = useWallet()
const { isAdmin } = useAdmin()
const { signMessageAsync } = useSignMessage()

const { data: plansList, isLoading: loading } = usePlansQuery()
const plans = computed(() => plansList.value ?? [])
const deletePlan = useDeletePlanMutation()

const isOwnPlan = (plan: Plan): boolean =>
  !!address.value && plan.creator?.toLowerCase() === address.value.toLowerCase()

const handleEdit = (plan: Plan) => {
  router.push({ name: 'edit-plan', params: { id: plan.id } })
}

const handleDelete = async (plan: Plan) => {
  if (!address.value) return
  try {
    const signature = await signMessageAsync({ message: `admin:delete-plan:${plan.id}` })
    const res = await deletePlan.mutateAsync({
      planId: plan.id,
      signature,
      address: address.value,
    })
    if (res.status >= 200 && res.status < 300) {
      // List auto-updates via invalidation
    } else {
      console.error('Delete failed:', res.status)
    }
  } catch (error) {
    console.error('Delete failed:', error)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem 0;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin: 0 0 1.5rem;
}

.status-text {
  color: var(--color-text-secondary, #9ca3af);
}

.plans-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
</style>
