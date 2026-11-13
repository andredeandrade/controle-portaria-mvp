'use client'

import type { CreateIncidentRequest, Incident } from '@/app/api/incidents/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { IncidentsServiceError, registerIncident } from '@/services/ocorrencias/service'

export function useCreateOccurrence() {
  const queryClient = useQueryClient()

  return useMutation<Incident, IncidentsServiceError, CreateIncidentRequest>({
    mutationFn: registerIncident,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'incidents')
    },
  })
}
