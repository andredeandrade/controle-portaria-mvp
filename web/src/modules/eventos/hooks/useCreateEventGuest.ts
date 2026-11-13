'use client'

import type { CreateEventGuestRequest, Event } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, createEventGuest } from '@/services/eventos/service'

export function useCreateEventGuest() {
  const queryClient = useQueryClient()

  return useMutation<
    Event,
    EventsServiceError,
    { eventId: string } & CreateEventGuestRequest
  >({
    mutationFn: (payload) => createEventGuest(payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
