'use client'

import type { CreateIncidentRequest, Incident } from '@/app/api/incidents/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { IncidentsServiceError, updateIncident } from '@/services/ocorrencias/service'

export function useUpdateOccurrence(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Incident, IncidentsServiceError, CreateIncidentRequest>({
    mutationFn: (payload) => updateIncident(id, payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'incidents')
    },
  })
}
