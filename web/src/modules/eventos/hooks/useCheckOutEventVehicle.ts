'use client'

import type { CheckOutEventVehicleRequest, Event } from '@/app/api/events/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { invalidateDomainQueries } from '@/lib/react-query/invalidation'
import { EventsServiceError, checkOutEventVehicle } from '@/services/eventos/service'

export function useCheckOutEventVehicle() {
  const queryClient = useQueryClient()

  return useMutation<
    Event,
    EventsServiceError,
    { eventId: string; vehicleId: string } & CheckOutEventVehicleRequest
  >({
    mutationFn: (payload) => checkOutEventVehicle(payload),
    onSuccess: async () => {
      await invalidateDomainQueries(queryClient, 'events')
    },
  })
}
