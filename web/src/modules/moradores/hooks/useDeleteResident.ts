'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { deleteResident, ResidentsServiceError } from '@/services/moradores/service'

export function useDeleteResident() {
  const queryClient = useQueryClient()

  return useMutation<void, ResidentsServiceError, string>({
    mutationFn: deleteResident,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'residents')
    },
  })
}
