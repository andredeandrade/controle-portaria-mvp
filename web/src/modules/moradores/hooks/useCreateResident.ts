'use client'

import type { CreateResidentRequest, Resident } from '@/app/api/residents/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { registerResident, ResidentsServiceError } from '@/services/moradores/service'

export function useCreateResident() {
  const queryClient = useQueryClient()

  return useMutation<Resident, ResidentsServiceError, CreateResidentRequest>({
    mutationFn: registerResident,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'residents')
    },
  })
}
