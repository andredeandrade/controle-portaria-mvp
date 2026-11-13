'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import {
  deleteServiceProvider,
  ServiceProvidersServiceError,
} from '@/services/prestadores-servicos/service'

export function useDeleteServiceProvider() {
  const queryClient = useQueryClient()

  return useMutation<void, ServiceProvidersServiceError, string>({
    mutationFn: deleteServiceProvider,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'service-providers')
    },
  })
}
