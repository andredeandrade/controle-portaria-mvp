'use client'

import type { CreateResidentRequest, Resident } from '@/app/api/residents/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { updateResident, ResidentsServiceError } from '@/services/moradores/service'

export function useUpdateResident(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Resident, ResidentsServiceError, CreateResidentRequest>({
    mutationFn: (payload) => updateResident(id, payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'residents')
    },
  })
}
