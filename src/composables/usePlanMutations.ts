import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  deleteApiPlansId,
  postApiPlans,
  putApiPlansId,
} from '@/api/generated/plans/plans'
import type { PostApiPlansBody } from '@/api/generated/models/postApiPlansBody'
import type { PutApiPlansIdBody } from '@/api/generated/models/putApiPlansIdBody'
import { queryKeys } from '@/api/query-keys'

function invalidatePlans(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.list() })
}

export function useDeletePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planId,
      signature,
      address,
    }: {
      planId: string
      signature: string
      address: string
    }) => {
      return deleteApiPlansId(planId, {
        headers: {
          'x-admin-signature': signature,
          'x-admin-address': address,
        },
      })
    },
    onSuccess: (res) => {
      if (res.status >= 200 && res.status < 300) {
        invalidatePlans(queryClient)
      }
    },
  })
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      body,
      signature,
      address,
    }: {
      body: PostApiPlansBody
      signature: string
      address: string
    }) => {
      return postApiPlans(body, {
        headers: {
          'x-admin-signature': signature,
          'x-admin-address': address,
        },
      })
    },
    onSuccess: (res) => {
      if (res.status >= 200 && res.status < 300) {
        invalidatePlans(queryClient)
      }
    },
  })
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planId,
      body,
      signature,
      address,
    }: {
      planId: string
      body: PutApiPlansIdBody
      signature: string
      address: string
    }) => {
      return putApiPlansId(planId, body, {
        headers: {
          'x-admin-signature': signature,
          'x-admin-address': address,
        },
      })
    },
    onSuccess: (res) => {
      if (res.status >= 200 && res.status < 300) {
        invalidatePlans(queryClient)
      }
    },
  })
}
