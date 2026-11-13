'use client'

import type { CheckInEventGuestRequest, Event } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, checkInEventGuest } from '@/services/eventos/service'

export function useCheckInEventGuest() {
  const queryClient = useQueryClient()

  return useMutation<
    Event,
    EventsServiceError,
    { eventId: string; guestId: string } & CheckInEventGuestRequest
  >({
    mutationFn: (payload) => checkInEventGuest(payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
