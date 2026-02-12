<template>
  <div class="edit-plan">
    <h1>Edit Plan</h1>

    <p v-if="loading" class="status-text">Loading plan...</p>
    <p v-else-if="error" class="status-text error-text">{{ error }}</p>

    <form v-else @submit.prevent="handleSubmit" class="edit-plan-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="formData.name" type="text" placeholder="e.g. Premium News" required />
      </div>

      <div class="form-group">
        <label for="slug">Slug</label>
        <input id="slug" v-model="formData.slug" type="text" placeholder="e.g. premium-news" required />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="formData.description" rows="3" placeholder="What does this plan include?" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="token">Token Address</label>
          <input id="token" v-model="formData.token" type="text" placeholder="0x..." required />
        </div>
        <div class="form-group form-group-small">
          <label for="tokenSymbol">Symbol</label>
          <input id="tokenSymbol" v-model="formData.tokenSymbol" type="text" placeholder="USDC" required />
        </div>
        <div class="form-group form-group-small">
          <label for="tokenDecimals">Decimals</label>
          <input id="tokenDecimals" v-model.number="formData.tokenDecimals" type="number" required />
        </div>
      </div>

      <div class="form-group">
        <label for="receiver">Receiver Address</label>
        <input id="receiver" v-model="formData.receiver" type="text" placeholder="0x..." required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="price">Price (base units)</label>
          <input id="price" v-model="formData.price" type="text" placeholder="e.g. 1000000 for 1 USDC" required />
        </div>
        <div class="form-group form-group-interval">
          <label>Billing Interval</label>
          <div class="interval-picker">
            <input id="intervalAmount" v-model.number="intervalAmount" type="number" min="1" required />
            <select id="intervalUnit" v-model="intervalUnit">
              <option value="60">Minutes</option>
              <option value="3600">Hours</option>
              <option value="86400">Days</option>
              <option value="604800">Weeks</option>
              <option value="2592000">Months</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="imageUrl">Image URL (optional)</label>
        <input id="imageUrl" v-model="formData.imageUrl" type="url" placeholder="https://..." />
      </div>

      <div class="form-actions">
        <BaseButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccount, useSignMessage } from '@wagmi/vue'
import { getApiPlansId, putApiPlansId } from '@/api/generated/plans/plans'
import type { PutApiPlansIdBody } from '@/api/generated/models/putApiPlansIdBody'
import type { Plan } from '@/api/types'
import BaseButton from '@/components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const { address } = useAccount()
const { signMessageAsync } = useSignMessage()

const loading = ref(true)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const intervalAmount = ref(1)
const intervalUnit = ref(2592000)

const formData = ref<PutApiPlansIdBody>({
  slug: '',
  receiver: '',
  token: '',
  tokenSymbol: '',
  tokenDecimals: 6,
  price: '',
  intervalSeconds: 0,
  name: '',
  description: '',
  imageUrl: '',
})

const UNIT_MULTIPLIERS = [2592000, 604800, 86400, 3600, 60] as const

const reverseInterval = (seconds: number) => {
  for (const m of UNIT_MULTIPLIERS) {
    if (seconds >= m && seconds % m === 0) {
      intervalAmount.value = seconds / m
      intervalUnit.value = m
      return
    }
  }
  // Fallback: show raw seconds as minutes
  intervalAmount.value = seconds
  intervalUnit.value = 1
}

const planId = route.params.id as string

const loadPlan = async () => {
  try {
    const res = await getApiPlansId(planId)
    if (res.status < 200 || res.status >= 300) {
      error.value = 'Plan not found.'
      return
    }
    const plan = res.data as unknown as Plan
    if (address.value && plan.creator?.toLowerCase() !== address.value.toLowerCase()) {
      error.value = 'You can only edit your own plans.'
      return
    }
    formData.value = {
      name: plan.name,
      slug: plan.slug ?? '',
      description: plan.description ?? '',
      receiver: plan.receiver ?? '',
      token: plan.token ?? '',
      tokenSymbol: plan.tokenSymbol ?? '',
      tokenDecimals: plan.tokenDecimals ?? 18,
      price: plan.price,
      intervalSeconds: plan.intervalSeconds ?? 0,
      imageUrl: plan.imageUrl ?? '',
    }
    reverseInterval(plan.intervalSeconds ?? 0)
  } catch {
    error.value = 'Failed to load plan.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPlan)

const handleSubmit = async () => {
  if (isSubmitting.value || !address.value) return

  formData.value.intervalSeconds = intervalAmount.value * intervalUnit.value

  isSubmitting.value = true
  try {
    const signature = await signMessageAsync({ message: `admin:update-plan:${planId}` })
    const response = await putApiPlansId(planId, formData.value, {
      headers: {
        'x-admin-signature': signature,
        'x-admin-address': address.value,
      },
    })
    if (response.status >= 200 && response.status < 300) {
      router.push({ name: 'plan', params: { slug: formData.value.slug || planId } })
    } else {
      const body = response.data as unknown as { error?: string } | undefined
      alert(body?.error ?? 'Failed to update plan. Please try again.')
    }
  } catch (err) {
    console.error('Error updating plan:', err)
    alert('An error occurred while updating the plan.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.edit-plan {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem 0;
}

.edit-plan h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin: 0 0 1.5rem;
}

.status-text {
  color: var(--color-text-secondary, #9ca3af);
}

.error-text {
  color: #ef4444;
}

.edit-plan-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group-small {
  max-width: 100px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #9ca3af);
}

.form-group input,
.form-group textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 8px;
  background: var(--color-bg-card, #1a1a2e);
  color: var(--color-text-primary, #fff);
  font-size: 0.9rem;
  font-family: inherit;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-bg-secondary, #1919e6);
}

.form-group-interval {
  flex: 1;
}

.interval-picker {
  display: flex;
  gap: 0.5rem;
}

.interval-picker input {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 8px;
  background: var(--color-bg-card, #1a1a2e);
  color: var(--color-text-primary, #fff);
  font-size: 0.9rem;
}

.interval-picker select {
  flex: 1;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 8px;
  background: var(--color-bg-card, #1a1a2e);
  color: var(--color-text-primary, #fff);
  font-size: 0.9rem;
  cursor: pointer;
}

.interval-picker input:focus,
.interval-picker select:focus {
  outline: none;
  border-color: var(--color-bg-secondary, #1919e6);
}

.form-actions {
  margin-top: 0.5rem;
}
</style>
