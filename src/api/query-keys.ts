export const queryKeys = {
  all: ['plans'] as const,
  lists: () => [...queryKeys.all] as const,
  list: () => [...queryKeys.all, 'list'] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,

  subscriptions: {
    all: ['subscriptions'] as const,
    list: (userId: string, chainId?: number) =>
      [...queryKeys.subscriptions.all, userId, chainId] as const,
  },
} as const
