<template>
  <button
    :disabled="disabled"
    :class="['base-button', { 'base-button--disabled': disabled }]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  min-width: 120px;
}

.base-button:hover:not(.base-button--disabled) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.base-button--disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.6;
}

.base-button--disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
