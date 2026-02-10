<template>
  <component
    :is="slug ? RouterLink : 'div'"
    :to="slug ? { name: 'plan', params: { slug } } : undefined"
    class="subscription-card"
  >
    <div class="card-header">
      <img :src="imageUrl" :alt="plan.name" class="header-image" />
    </div>

    <div class="card-content">
      <div class="content-header">
        <h3 class="title">{{ plan.name }}</h3>
      </div>

      <p v-if="plan.description" class="description">{{ plan.description }}</p>

      <div class="price">{{ displayPrice }} <span class="token-symbol">{{ plan.tokenSymbol ?? '' }}</span></div>

      <div class="interval">every {{ formatInterval(plan.intervalSeconds) }}</div>

      <BaseButton @click.stop="$emit('subscribe')">Subscribe</BaseButton>
      <button
        v-if="showEdit"
        class="edit-button"
        @click.stop.prevent="$emit('edit')"
        title="Edit plan"
      >
        <Pencil :size="16" /> Edit
      </button>
      <button
        v-if="showDelete"
        class="delete-button"
        @click.stop.prevent="$emit('delete')"
        title="Delete plan"
      >
        <Trash2 :size="16" /> Delete
      </button>
    </div>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from './BaseButton.vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Plan } from '@/api/types'
import { formatPrice, formatInterval } from '@/utils/format'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop&crop=center'

const props = defineProps<{
  plan: Plan
  showDelete?: boolean
  showEdit?: boolean
}>()

defineEmits<{
  subscribe: []
  delete: []
  edit: []
}>()

const slug = computed(() => props.plan.slug ?? props.plan.id)
const imageUrl = computed(() => props.plan.imageUrl ?? DEFAULT_IMAGE)
const displayPrice = computed(() => formatPrice(props.plan.price, props.plan.tokenDecimals ?? 18))
</script>

<style scoped>
.subscription-card {
  width: 340px;
  background: var(--color-bg-card, #1a1a2e);
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: var(--border-radius-lg, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-card, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  text-decoration: none;
  color: inherit;
  display: block;
  transition: border-color 0.2s;
}

.subscription-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.card-header {
  background: var(--color-bg-header, #0f3460);
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 140px;
  overflow: hidden;
}

.header-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  object-position: center;
}

.card-content {
  background: var(--color-bg-content, #16213e);
  padding: var(--spacing-lg, 24px);
}

.content-header {
  margin-bottom: var(--spacing-sm, 8px);
}

.title {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #fff);
  margin: 0;
}

.description {
  color: var(--color-text-secondary, #9ca3af);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 var(--spacing-md, 16px) 0;
}

.price {
  color: var(--color-text-primary, #fff);
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold, 700);
  margin-bottom: 4px;
}

.token-symbol {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium, 500);
  opacity: 0.7;
}

.interval {
  color: var(--color-text-secondary, #9ca3af);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg, 24px);
}

.edit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 6px;
  background: transparent;
  color: #3b82f6;
  cursor: pointer;
  width: 100%;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: rgba(59, 130, 246, 0.15);
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 6px;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  width: 100%;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: rgba(239, 68, 68, 0.15);
}
</style>
