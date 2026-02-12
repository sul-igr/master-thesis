<template>
  <div class="create-plan">
    <h1>Create Plan</h1>
    <form @submit.prevent="handleSubmit" class="create-plan-form">
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

      <div class="form-group">
        <label for="chainId">Chain</label>
        <select id="chainId" v-model.number="formData.chainId" required>
          <option v-for="chain in supportedChains" :key="chain.id" :value="chain.id">
            {{ chain.name }}
          </option>
        </select>
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
          {{ isSubmitting ? 'Creating...' : 'Create Plan' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount } from '@wagmi/vue'
import { postApiPlans } from '@/api/generated/plans/plans'
import type { PostApiPlansBody } from '@/api/generated/models/postApiPlansBody'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const { address, chainId } = useAccount()

const supportedChains = [
  { id: 31337, name: 'Anvil (localhost)' },
  { id: 11155111, name: 'Sepolia' },
  { id: 17000, name: 'Holesky' },
]

const defaultChainId = supportedChains.find((c) => c.id === chainId.value)?.id ?? 31337

const isSubmitting = ref(false)
const intervalAmount = ref(1)
const intervalUnit = ref(2592000)

const formData = ref<PostApiPlansBody>({
  slug: '',
  creator: address.value ?? '',
  receiver: '',
  chainId: defaultChainId,
  token: '',
  tokenSymbol: '',
  tokenDecimals: 6,
  price: '',
  intervalSeconds: 0,
  name: '',
  description: '',
  imageUrl: '',
})

const handleSubmit = async () => {
  if (isSubmitting.value) return

  // Ensure creator is always set from connected wallet
  formData.value.creator = address.value ?? ''
  formData.value.intervalSeconds = intervalAmount.value * intervalUnit.value

  isSubmitting.value = true
  try {
    const response = await postApiPlans(formData.value)

    if (response.status >= 200 && response.status < 300) {
      router.push({ name: 'home' })
    } else {
      const body = response.data as unknown as { error?: string } | undefined
      alert(body?.error ?? 'Failed to create plan. Please try again.')
    }
  } catch (error) {
    console.error('Error creating plan:', error)
    alert('An error occurred while creating the plan.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-plan {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem 0;
}

.create-plan h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #fff);
  margin: 0 0 1.5rem;
}

.create-plan-form {
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
.form-group textarea,
.form-group select {
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

.form-group select {
  cursor: pointer;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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
