import { ref, watch } from 'vue'
import { useWallet } from '@/composables/useWallet'
import { checkIsAdmin } from '@/api/admin'

export function useAdmin() {
  const { address } = useWallet()
  const isAdmin = ref(false)

  watch(
    address,
    async (addr) => {
      if (!addr) {
        isAdmin.value = false
        return
      }
      isAdmin.value = await checkIsAdmin(addr)
    },
    { immediate: true },
  )

  return { isAdmin }
}
