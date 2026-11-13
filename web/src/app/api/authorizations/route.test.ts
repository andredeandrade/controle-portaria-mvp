import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'

import { DELETE, GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const AUTORIZACAO = {
  authorizedName: 'Ana Fictícia',
  personType: 'visitante',
  document: '11122233',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
  validFromDate: '2026-11-12',
  validFromTime: '08:00',
  validToDate: '2026-11-12',
  validToTime: '18:00',
}
const COMUM = {
  unauthenticatedMessage: 'Nao autenticado.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de autorizacoes.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/authorizations',
  invoke: () => GET(bffRequest('/api/authorizations?search=ana')),
  upstream: { method: 'GET', url: '/authorizations?page=1&pageSize=10&search=ana' },
  apiResponse: {
    body: { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } },
  },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/authorizations',
  invoke: () => POST(bffRequest('/api/authorizations', { method: 'POST', body: AUTORIZACAO })),
  upstream: { method: 'POST', url: '/authorizations', body: AUTORIZACAO },
  apiResponse: { body: { id: 'autorizacao-1', ...AUTORIZACAO }, status: 201 },
  successStatus: 201,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/authorizations',
  invoke: () =>
    DELETE(bffRequest('/api/authorizations', { method: 'DELETE', body: { id: 'autorizacao-1' } })),
  upstream: { method: 'DELETE', url: '/authorizations/autorizacao-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})
