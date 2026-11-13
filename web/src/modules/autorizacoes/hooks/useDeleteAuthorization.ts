'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { deleteAuthorization, AuthorizationsServiceError } from '@/services/autorizacoes/service'

export function useDeleteAuthorization() {
  const queryClient = useQueryClient()

  return useMutation<void, AuthorizationsServiceError, string>({
    mutationFn: deleteAuthorization,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'authorizations')
    },
  })
}
