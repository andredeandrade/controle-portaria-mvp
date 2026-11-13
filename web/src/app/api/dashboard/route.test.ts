import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { GET } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

describeProtectedRouteContract({
  name: 'GET /api/dashboard',
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de dashboard.',
  invoke: () => GET(bffRequest('/api/dashboard?period=last7days')),
  upstream: { method: 'GET', url: '/dashboard/summary?period=last7days' },
  apiResponse: { body: { activeAccesses: 2, authorizations: 1, events: 0 } },
  successStatus: 200,
})

describe('/api/dashboard (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('usa period=today por padrão', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ activeAccesses: 0 }))

    await GET(bffRequest('/api/dashboard'))

    expect(getFetchCall(fetchMock).url).toBe('http://api.test/api/dashboard/summary?period=today')
  })

  it.each(['week', 'today&foo=bar', 'month#x'])(
    'responde 400 para period inválido (%s), sem chamar a API',
    async (period) => {
      const response = await GET(bffRequest(`/api/dashboard?period=${encodeURIComponent(period)}`))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        message: 'Período inválido. Use today, last7days ou month.',
      })
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )
})
