'use client'

import type { Event } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, checkOutEventGuest } from '@/services/eventos/service'

export function useCheckOutEventGuest() {
  const queryClient = useQueryClient()

  return useMutation<Event, EventsServiceError, { eventId: string; guestId: string }>({
    mutationFn: (payload) => checkOutEventGuest(payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
