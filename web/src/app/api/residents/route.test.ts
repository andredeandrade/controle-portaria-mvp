import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { resetCookies, signIn } from '@test/next-headers'

import { DELETE, GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const LISTA = { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } }
const NOVO_MORADOR = {
  fullName: 'Carlos Fictício',
  units: ['Bloco B - 202'],
  relation: 'proprietario',
  document: '98765432',
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de moradores.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/residents',
  invoke: () => GET(bffRequest('/api/residents?page=2&pageSize=20&search=%20carlos%20')),
  upstream: { method: 'GET', url: '/residents?page=2&pageSize=20&search=carlos' },
  apiResponse: { body: LISTA },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/residents',
  invoke: () => POST(bffRequest('/api/residents', { method: 'POST', body: NOVO_MORADOR })),
  upstream: { method: 'POST', url: '/residents', body: NOVO_MORADOR },
  apiResponse: { body: { id: 'morador-1', ...NOVO_MORADOR }, status: 201 },
  successStatus: 201,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/residents',
  invoke: () =>
    DELETE(bffRequest('/api/residents', { method: 'DELETE', body: { id: 'morador-1' } })),
  upstream: { method: 'DELETE', url: '/residents/morador-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})

describe('/api/residents (regras do handler)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
    resetCookies()
    signIn()
  })

  it('GET aplica page=1 e pageSize=10 por padrão e omite search vazio', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(LISTA))

    await GET(bffRequest('/api/residents?search=%20%20'))

    expect(getFetchCall(fetchMock).url).toBe('http://api.test/api/residents?page=1&pageSize=10')
  })

  it('POST descarta campos fora do contrato (ex.: condominiumId de outro tenant)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'morador-1' }, 201))

    await POST(
      bffRequest('/api/residents', {
        method: 'POST',
        body: { ...NOVO_MORADOR, condominiumId: 'condominio-b', createdByUserId: 'intruso' },
      }),
    )

    const enviado: unknown = JSON.parse(String(getFetchCall(fetchMock).init.body))
    expect(enviado).toEqual(NOVO_MORADOR)
  })

  it('POST aceita `unit` legado como lista de uma unidade', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'morador-1' }, 201))
    const { fullName, relation, document } = NOVO_MORADOR

    await POST(
      bffRequest('/api/residents', {
        method: 'POST',
        body: { fullName, relation, document, unit: 'Bloco C - 1' },
      }),
    )

    expect(JSON.parse(String(getFetchCall(fetchMock).init.body))).toMatchObject({
      units: ['Bloco C - 1'],
    })
  })

  it('POST responde 400 para corpo que não é JSON, sem chamar a API', async () => {
    const response = await POST(bffRequest('/api/residents', { method: 'POST', body: 'nao-json' }))

    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('DELETE responde 400 sem id, sem chamar a API', async () => {
    const response = await DELETE(
      bffRequest('/api/residents', { method: 'DELETE', body: { id: '   ' } }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ message: 'ID do morador é obrigatório.' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('DELETE codifica o id no caminho da API (não permite sair de /residents)', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await DELETE(bffRequest('/api/residents', { method: 'DELETE', body: { id: '../users/x' } }))

    expect(getFetchCall(fetchMock).url).toBe('http://api.test/api/residents/..%2Fusers%2Fx')
  })
})
