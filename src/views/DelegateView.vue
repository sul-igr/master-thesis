<template>
  <div class="delegate-page">
    <div class="delegate-card">
      <div class="delegate-header">
        <h1 class="delegate-title">Delegate to access the app</h1>
        <p class="delegate-desc">
          Your wallet must be delegated before you can use the app. Run the command below in your
          terminal.
        </p>
      </div>

      <div class="command-block">
        <p class="command-intro">
          Make sure you have
          <a href="https://getfoundry.sh" target="_blank" rel="noopener" class="link">Foundry</a>
          installed. Then run:
        </p>
        <div class="command-wrapper">
          <pre class="command-pre">{{ delegationCommand }}</pre>
          <button type="button" class="copy-btn" @click="copyCommand">
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
      </div>

      <p class="delegate-cta">
        After running the command and signing in your wallet, click below to continue.
      </p>

      <div class="delegate-actions">
        <BaseButton :disabled="checking" @click="recheckAndContinue">
          {{ checking ? 'Checking…' : "I've delegated – continue" }}
        </BaseButton>
        <button type="button" class="disconnect-btn" @click="disconnectWallet">Disconnect</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAccount } from '@wagmi/vue'
import BaseButton from '@/components/BaseButton.vue'
import { useEIP7702 } from '@/composables/useEip7702'
import { getPostDelegationsUrl } from '@/api/generated/delegations/delegations'
import { ACCOUNT_IMPLEMENTATION_ADDRESS } from '@/constants'
import { useWallet } from '@/composables/useWallet'

const router = useRouter()
const { address, chainId } = useAccount()
const { isDelegated } = useEIP7702()
const { disconnectWallet } = useWallet()

const copied = ref(false)
const checking = ref(false)

const apiBase = computed(() => {
  const url = getPostDelegationsUrl()
  return url.replace(/\/delegations\/?$/, '')
})

const rpcUrlByChainId: Record<number, string> = {
  1: 'https://eth.merkle.io',
  11155111: 'https://rpc.sepolia.org',
  31337: 'http://127.0.0.1:8545',
  1337: 'http://127.0.0.1:8545',
}

const delegationCommand = computed(() => {
  const signer = address.value ?? '<YOUR_ADDRESS>'
  const cid = chainId.value ?? 1
  const rpc = rpcUrlByChainId[cid] ?? 'https://eth.merkle.io'
  return `cast wallet sign-auth -i --rpc-url ${rpc} ${ACCOUNT_IMPLEMENTATION_ADDRESS} | \\
  xargs -S 4096 -I{} curl -s -X POST ${apiBase.value}/delegations \\
  -H "Content-Type: application/json" \\
  -d "{\\"signedAuthorization\\":\\"{}\\", \\"signerAddress\\":\\"${signer}\\"}"`
})

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(delegationCommand.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // ignore
  }
}

async function recheckAndContinue() {
  checking.value = true
  try {
    const isDelegatedValue = await isDelegated()
    console.log('isDelegated', isDelegatedValue)
    if (isDelegatedValue) {
      await router.replace({ name: 'home' })
    }
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.delegate-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.delegate-card {
  width: 100%;
  max-width: 32rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.delegate-header {
  text-align: center;
}

.delegate-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.delegate-desc {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.command-block {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-content);
  padding: 1rem;
}

.command-intro {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem;
}

.link {
  color: var(--color-bg-secondary);
  text-decoration: underline;
}

.link:hover {
  opacity: 0.9;
}

.command-wrapper {
  position: relative;
}

.command-pre {
  margin: 0;
  padding: 1rem;
  padding-right: 4rem;
  overflow-x: auto;
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-break: break-all;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.25);
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 6px;
  border: none;
  background: var(--color-bg-muted);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: var(--color-bg-primary-hover);
}

.delegate-cta {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
}

.delegate-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.disconnect-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.disconnect-btn:hover {
  background: var(--color-bg-muted);
}
</style>
