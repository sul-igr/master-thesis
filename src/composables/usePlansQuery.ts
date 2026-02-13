import { useQuery } from '@tanstack/vue-query'
import { getApiPlans, getApiPlansId } from '@/api/generated/plans/plans'
import { queryKeys } from '@/api/query-keys'
import type { Plan } from '@/api/types'

async function fetchPlans(): Promise<Plan[]> {
  const res = await getApiPlans()
  const data = res.data as Plan[] | undefined
  return Array.isArray(data) ? data : []
}

export function usePlansQuery() {
  return useQuery({
    queryKey: queryKeys.list(),
    queryFn: fetchPlans,
  })
}

export function usePlanByIdQuery(planId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.detail(planId ?? ''),
    queryFn: async (): Promise<Plan | null> => {
      if (!planId) return null
      const res = await getApiPlansId(planId)
      if (res.status < 200 || res.status >= 300) return null
      return res.data as unknown as Plan
    },
    enabled: !!planId,
  })
}
