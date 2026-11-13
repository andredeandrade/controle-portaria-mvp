import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const ENTRADA = {
  people: [{ category: 'visitante', name: 'Joana Fictícia', document: '12345678', unit: 'A-101' }],
  locomotion: 'carro',
  plate: 'ABC1D23',
}
const LISTA = { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } }
const COMUM = {
  unauthenticatedMessage: 'Nao autenticado.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de registros de acesso.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/access-records',
  invoke: () => GET(bffRequest('/api/access-records?status=open&search=joana')),
  upstream: { method: 'GET', url: '/access-records?page=1&pageSize=10&status=open&search=joana' },
  apiResponse: { body: LISTA },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/access-records',
  invoke: () => POST(bffRequest('/api/access-records', { method: 'POST', body: ENTRADA })),
  upstream: { method: 'POST', url: '/access-records/check-in', body: ENTRADA },
  apiResponse: { body: { id: 'acesso-1', isOpen: true }, status: 201 },
  successStatus: 201,
})

describe('/api/access-records (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('GET usa status=all por padrão', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(LISTA))

    await GET(bffRequest('/api/access-records'))

    expect(getFetchCall(fetchMock).url).toBe(
      'http://api.test/api/access-records?page=1&pageSize=10&status=all',
    )
  })

  it('POST normaliza as pessoas e descarta campos extras', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'acesso-1' }, 201))

    await POST(
      bffRequest('/api/access-records', {
        method: 'POST',
        body: {
          people: [{ category: 'prestador', name: 'Pedro Fictício', condominiumId: 'b' }],
          condominiumId: 'condominio-b',
        },
      }),
    )

    expect(JSON.parse(String(getFetchCall(fetchMock).init.body))).toEqual({
      people: [{ category: 'prestador', name: 'Pedro Fictício' }],
    })
  })
})
