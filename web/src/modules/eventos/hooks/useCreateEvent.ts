'use client'

import type { CreateEventRequest, Event } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, registerEvent } from '@/services/eventos/service'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation<Event, EventsServiceError, CreateEventRequest>({
    mutationFn: registerEvent,
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
