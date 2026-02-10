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
        :showEdit="isOwnPlan(plan)"
        :showDelete="isOwnPlan(plan)"
        @subscribe="handleSubscribe(plan)"
        @edit="handleEdit(plan)"
        @delete="handleDelete(plan)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubscriptionCard from '@/components/SubscriptionCard.vue'
import { getApiPlans, deleteApiPlansId } from '@/api/generated/plans/plans'
import type { Plan } from '@/api/types'
import { useSubscribe } from '@/composables/useSubscribe'

const router = useRouter()
const { subscribe, address } = useSubscribe()

const plans = ref<Plan[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const plansRes = await getApiPlans()
    const data = plansRes.data as Plan[] | undefined
    plans.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load plans:', error)
  } finally {
    loading.value = false
  }
})

function isOwnPlan(plan: Plan): boolean {
  return !!address.value && plan.creator?.toLowerCase() === address.value.toLowerCase()
}

async function handleSubscribe(plan: Plan) {
  const { success, error } = await subscribe(plan)
  if (!success) {
    console.error('Subscribe failed:', error)
  }
}

function handleEdit(plan: Plan) {
  router.push({ name: 'edit-plan', params: { id: plan.id } })
}

async function handleDelete(plan: Plan) {
  try {
    const res = await deleteApiPlansId(plan.id)
    if (res.status >= 200 && res.status < 300) {
      plans.value = plans.value.filter((p) => p.id !== plan.id)
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
