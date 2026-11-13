import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

describeProtectedRouteContract({
  name: 'POST /api/events/guests/check-in',
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de eventos.',
  invoke: () =>
    POST(
      bffRequest('/api/events/guests/check-in', {
        method: 'POST',
        body: { eventId: 'evento-1', guestId: 'convidado-1', document: '12345678' },
      }),
    ),
  upstream: {
    method: 'POST',
    url: '/events/evento-1/guests/convidado-1/check-in',
    body: { document: '12345678' },
  },
  apiResponse: { body: { id: 'evento-1' } },
  successStatus: 200,
})

describe('POST /api/events/guests/check-in (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('responde 400 sem eventId/guestId, sem chamar a API', async () => {
    const response = await POST(
      bffRequest('/api/events/guests/check-in', { method: 'POST', body: { eventId: 'evento-1' } }),
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
