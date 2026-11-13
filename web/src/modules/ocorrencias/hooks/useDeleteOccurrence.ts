'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { deleteIncident, IncidentsServiceError } from '@/services/ocorrencias/service'

export function useDeleteOccurrence() {
  const queryClient = useQueryClient()

  return useMutation<void, IncidentsServiceError, string>({
    mutationFn: deleteIncident,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'incidents')
    },
  })
}
