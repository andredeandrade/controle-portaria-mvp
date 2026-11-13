import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { buildVisitor, buildVisitorsPage } from '@test/factories/visitors'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { DELETE, GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const NOVO_VISITANTE = {
  fullName: 'Joana Fictícia',
  document: '12345678',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de visitantes.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/visitors',
  invoke: () => GET(bffRequest('/api/visitors?page=3&pageSize=5&search=joana')),
  upstream: { method: 'GET', url: '/visitors?page=3&pageSize=5&search=joana' },
  apiResponse: { body: buildVisitorsPage([buildVisitor()]) },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/visitors',
  invoke: () => POST(bffRequest('/api/visitors', { method: 'POST', body: NOVO_VISITANTE })),
  upstream: { method: 'POST', url: '/visitors', body: NOVO_VISITANTE },
  apiResponse: { body: buildVisitor(), status: 201 },
  successStatus: 201,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/visitors',
  invoke: () =>
    DELETE(bffRequest('/api/visitors', { method: 'DELETE', body: { id: 'visitante-1' } })),
  upstream: { method: 'DELETE', url: '/visitors/visitante-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})

describe('/api/visitors (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('POST descarta campos fora do contrato (ex.: condominiumId)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(buildVisitor(), 201))

    await POST(
      bffRequest('/api/visitors', {
        method: 'POST',
        body: { ...NOVO_VISITANTE, condominiumId: 'condominio-b' },
      }),
    )

    expect(JSON.parse(String(getFetchCall(fetchMock).init.body))).toEqual(NOVO_VISITANTE)
  })

  it('POST responde 400 para corpo inválido', async () => {
    const response = await POST(bffRequest('/api/visitors', { method: 'POST', body: '{' }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('DELETE responde 400 sem id', async () => {
    const response = await DELETE(bffRequest('/api/visitors', { method: 'DELETE', body: {} }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'ID do visitante é obrigatório.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
