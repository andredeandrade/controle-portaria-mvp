import { NOVO_EVENTO } from '@test/factories/payloads'
import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useCheckInEventGuest } from './useCheckInEventGuest'
import { useCheckOutEventGuest } from './useCheckOutEventGuest'
import { useCheckOutEventVehicle } from './useCheckOutEventVehicle'
import { useCreateEvent } from './useCreateEvent'
import { useCreateEventGuest } from './useCreateEventGuest'
import { useCreateEventVehicle } from './useCreateEventVehicle'
import { useDeleteEvent } from './useDeleteEvent'
import { useDeleteEventVehicle } from './useDeleteEventVehicle'
import { useRegisterEventAccess } from './useRegisterEventAccess'
import { useUpdateEvent } from './useUpdateEvent'

const INVALIDA = ['events', 'dashboard', 'reports'] as const

describeMutationHook({
  name: 'useCreateEvent',
  useHook: useCreateEvent,
  variables: NOVO_EVENTO,
  upstream: { method: 'POST', url: '/api/events' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useUpdateEvent',
  useHook: () => useUpdateEvent('evento-1'),
  variables: { title: 'Novo título fictício' },
  upstream: { method: 'PATCH', url: '/api/events/evento-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteEvent',
  useHook: useDeleteEvent,
  variables: 'evento-1',
  upstream: { method: 'DELETE', url: '/api/events' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCreateEventGuest',
  useHook: useCreateEventGuest,
  variables: { eventId: 'evento-1', name: 'Convidado Fictício' },
  upstream: { method: 'POST', url: '/api/events/guests' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCheckInEventGuest',
  useHook: useCheckInEventGuest,
  variables: { eventId: 'evento-1', guestId: 'convidado-1' },
  upstream: { method: 'POST', url: '/api/events/guests/check-in' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCheckOutEventGuest',
  useHook: useCheckOutEventGuest,
  variables: { eventId: 'evento-1', guestId: 'convidado-1' },
  upstream: { method: 'POST', url: '/api/events/guests/check-out' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCreateEventVehicle',
  useHook: useCreateEventVehicle,
  variables: { eventId: 'evento-1', plate: 'ABC1D23' },
  upstream: { method: 'POST', url: '/api/events/vehicles' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCheckOutEventVehicle',
  useHook: useCheckOutEventVehicle,
  variables: { eventId: 'evento-1', vehicleId: 'veiculo-1' },
  upstream: { method: 'POST', url: '/api/events/vehicles/check-out' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteEventVehicle',
  useHook: useDeleteEventVehicle,
  variables: { eventId: 'evento-1', vehicleId: 'veiculo-1' },
  upstream: { method: 'DELETE', url: '/api/events/vehicles' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useRegisterEventAccess',
  useHook: useRegisterEventAccess,
  variables: {
    eventId: 'evento-1',
    payload: { movementType: 'CONVIDADO', guests: [{ guestId: 'convidado-1' }] },
  },
  upstream: { method: 'POST', url: '/api/events/access' },
  invalidates: INVALIDA,
})
