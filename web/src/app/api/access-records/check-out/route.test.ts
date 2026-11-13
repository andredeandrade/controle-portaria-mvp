import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

describeProtectedRouteContract({
  name: 'POST /api/access-records/check-out',
  unauthenticatedMessage: 'Nao autenticado.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de registros de acesso.',
  invoke: () =>
    POST(
      bffRequest('/api/access-records/check-out', {
        method: 'POST',
        body: { id: 'acesso-1', observations: 'Saiu a pé', personIds: [' pessoa-1 '] },
      }),
    ),
  upstream: {
    method: 'POST',
    url: '/access-records/acesso-1/check-out',
    body: { observations: 'Saiu a pé', personIds: ['pessoa-1'] },
  },
  apiResponse: { body: { id: 'acesso-1', isOpen: false } },
  successStatus: 200,
})

describe('POST /api/access-records/check-out (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('responde 400 sem id do registro, sem chamar a API', async () => {
    const response = await POST(
      bffRequest('/api/access-records/check-out', { method: 'POST', body: { id: ' ' } }),
    )

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
