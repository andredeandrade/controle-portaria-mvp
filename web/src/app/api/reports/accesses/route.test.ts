import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { GET } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const PAGINA = { items: [], pagination: { page: 1, pageSize: 50, total: 0, totalPages: 1 } }

describeProtectedRouteContract({
  name: 'GET /api/reports/accesses',
  unauthenticatedMessage: 'Nao autenticado.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de relatorios.',
  invoke: () => GET(bffRequest('/api/reports/accesses?from=2026-11-01&to=2026-11-30')),
  upstream: { method: 'GET', url: '/reports/accesses?from=2026-11-01&to=2026-11-30' },
  apiResponse: { body: PAGINA },
  successStatus: 200,
})

describe('GET /api/reports/accesses (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('repassa só os filtros conhecidos (descarta condominiumId e similares)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA))

    await GET(
      bffRequest('/api/reports/accesses?status=open&condominiumId=condominio-b&visitor=joana'),
    )

    expect(getFetchCall(fetchMock).url).toBe(
      'http://api.test/api/reports/accesses?status=open&visitor=joana',
    )
  })

  it('não adiciona query string sem filtros', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(PAGINA))

    await GET(bffRequest('/api/reports/accesses'))

    expect(getFetchCall(fetchMock).url).toBe('http://api.test/api/reports/accesses')
  })
})
