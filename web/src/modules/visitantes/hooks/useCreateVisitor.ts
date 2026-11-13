'use client'

import type { CreateVisitorRequest, Visitor } from '@/app/api/visitors/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { registerVisitor, VisitorsServiceError } from '@/services/visitantes/service'

export function useCreateVisitor() {
  const queryClient = useQueryClient()

  return useMutation<Visitor, VisitorsServiceError, CreateVisitorRequest>({
    mutationFn: registerVisitor,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'visitors')
    },
  })
}
