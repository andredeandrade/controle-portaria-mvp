import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'

import { DELETE, GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const PRESTADOR = {
  companyName: 'Empresa Fictícia Ltda',
  responsibleName: 'Paulo Fictício',
  document: '44455566',
  serviceType: 'Manutenção',
  authorizedBy: 'Síndico Fictício',
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de prestadores.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/service-providers',
  invoke: () => GET(bffRequest('/api/service-providers?page=2')),
  upstream: { method: 'GET', url: '/service-providers?page=2&pageSize=10' },
  apiResponse: {
    body: { items: [], pagination: { page: 2, pageSize: 10, total: 0, totalPages: 1 } },
  },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/service-providers',
  invoke: () => POST(bffRequest('/api/service-providers', { method: 'POST', body: PRESTADOR })),
  upstream: { method: 'POST', url: '/service-providers', body: PRESTADOR },
  apiResponse: { body: { id: 'prestador-1', ...PRESTADOR }, status: 201 },
  successStatus: 201,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/service-providers',
  invoke: () =>
    DELETE(bffRequest('/api/service-providers', { method: 'DELETE', body: { id: 'prestador-1' } })),
  upstream: { method: 'DELETE', url: '/service-providers/prestador-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})
