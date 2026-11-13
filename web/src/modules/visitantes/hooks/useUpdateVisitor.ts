'use client'

import type { CreateVisitorRequest, Visitor } from '@/app/api/visitors/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { updateVisitor, VisitorsServiceError } from '@/services/visitantes/service'

export function useUpdateVisitor(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Visitor, VisitorsServiceError, CreateVisitorRequest>({
    mutationFn: (payload) => updateVisitor(id, payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'visitors')
    },
  })
}
