'use client'

import type {
  CreateServiceProviderRequest,
  ServiceProvider,
} from '@/app/api/service-providers/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import {
  registerServiceProvider,
  ServiceProvidersServiceError,
} from '@/services/prestadores-servicos/service'

export function useCreateServiceProvider() {
  const queryClient = useQueryClient()

  return useMutation<ServiceProvider, ServiceProvidersServiceError, CreateServiceProviderRequest>({
    mutationFn: registerServiceProvider,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'service-providers')
    },
  })
}
