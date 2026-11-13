import { beforeEach, describe, expect, it } from 'vitest'

import type { CreateEventRequest } from '@/app/api/events/types'
import { describeCrudServiceContract } from '@test/crud-service-contract'
import { NOVO_EVENTO } from '@test/factories/payloads'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'

import {
  EventsServiceError,
  checkInEventGuest,
  checkOutEventGuest,
  checkOutEventVehicle,
  createEventGuest,
  createEventVehicle,
  deleteEvent,
  deleteEventVehicle,
  getEvent,
  listEvents,
  registerEvent,
  registerEventAccess,
  updateEvent,
} from './service'

describeCrudServiceContract<CreateEventRequest>({
  bffPath: '/api/events',
  ServiceError: EventsServiceError,
  list: listEvents,
  register: registerEvent,
  get: getEvent,
  update: updateEvent,
  remove: deleteEvent,
  createPayload: NOVO_EVENTO,
  deleteBy: 'body',
})

type EventAction = {
  name: string
  run: () => Promise<unknown>
  url: string
  method: 'POST' | 'DELETE'
  body: unknown
}

const ACOES: EventAction[] = [
  {
    name: 'checkInEventGuest',
    run: () => checkInEventGuest({ eventId: 'e-1', guestId: 'g-1', document: '123' }),
    url: '/api/events/guests/check-in',
    method: 'POST',
    body: { eventId: 'e-1', guestId: 'g-1', document: '123' },
  },
  {
    name: 'checkOutEventGuest',
    run: () => checkOutEventGuest({ eventId: 'e-1', guestId: 'g-1' }),
    url: '/api/events/guests/check-out',
    method: 'POST',
    body: { eventId: 'e-1', guestId: 'g-1' },
  },
  {
    name: 'createEventGuest',
    run: () => createEventGuest({ eventId: 'e-1', name: 'Convidado Fictício' }),
    url: '/api/events/guests',
    method: 'POST',
    body: { eventId: 'e-1', name: 'Convidado Fictício' },
  },
  {
    name: 'createEventVehicle',
    run: () => createEventVehicle({ eventId: 'e-1', plate: 'ABC1D23' }),
    url: '/api/events/vehicles',
    method: 'POST',
    body: { eventId: 'e-1', plate: 'ABC1D23' },
  },
  {
    name: 'checkOutEventVehicle',
    run: () => checkOutEventVehicle({ eventId: 'e-1', vehicleId: 'v-1', guestIds: ['g-1'] }),
    url: '/api/events/vehicles/check-out',
    method: 'POST',
    body: { eventId: 'e-1', vehicleId: 'v-1', guestIds: ['g-1'] },
  },
  {
    name: 'deleteEventVehicle',
    run: () => deleteEventVehicle({ eventId: 'e-1', vehicleId: 'v-1' }),
    url: '/api/events/vehicles',
    method: 'DELETE',
    body: { eventId: 'e-1', vehicleId: 'v-1' },
  },
  {
    name: 'registerEventAccess',
    run: () =>
      registerEventAccess('e-1', { movementType: 'CONVIDADO', guests: [{ guestId: 'g-1' }] }),
    url: '/api/events/access',
    method: 'POST',
    body: { eventId: 'e-1', movementType: 'CONVIDADO', guests: [{ guestId: 'g-1' }] },
  },
]

describe('services/eventos (ações de convidados/veículos)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  describe.each(ACOES)('$name', ({ run, url, method, body }) => {
    it(`envia ${method} ${url} com o corpo esperado e devolve o evento`, async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'e-1' }))

      await expect(run()).resolves.toEqual({ id: 'e-1' })

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe(url)
      expect(call.init.method).toBe(method)
      expect(JSON.parse(String(call.init.body))).toEqual(body)
    })

    it('propaga a mensagem do BFF como EventsServiceError', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Convidado já entrou.' }, 409))

      const error = await run().catch((e: unknown) => e)

      expect(error).toBeInstanceOf(EventsServiceError)
      expect(error).toHaveProperty('message', 'Convidado já entrou.')
    })

    it('rejeita sucesso sem id', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({}))

      await expect(run()).rejects.toBeInstanceOf(EventsServiceError)
    })
  })
})
