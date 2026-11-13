'use client'

import type { Event, UpdateEventRequest } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, updateEvent } from '@/services/eventos/service'

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Event, EventsServiceError, UpdateEventRequest>({
    mutationFn: (payload) => updateEvent(id, payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
