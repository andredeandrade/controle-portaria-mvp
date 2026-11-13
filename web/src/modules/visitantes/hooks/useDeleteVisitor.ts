'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { deleteVisitor, VisitorsServiceError } from '@/services/visitantes/service'

export function useDeleteVisitor() {
  const queryClient = useQueryClient()

  return useMutation<void, VisitorsServiceError, string>({
    mutationFn: deleteVisitor,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'visitors')
    },
  })
}
