import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract, routeParams } from '@test/bff-route-contract'

import { GET, PATCH } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const MORADOR = {
  fullName: 'Carlos Fictício',
  units: ['Bloco B - 202'],
  relation: 'inquilino',
  document: '98765432',
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de moradores.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/residents/[id]',
  invoke: () => GET(bffRequest('/api/residents/morador-1'), routeParams('morador-1')),
  upstream: { method: 'GET', url: '/residents/morador-1' },
  apiResponse: { body: { id: 'morador-1', ...MORADOR } },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'PATCH /api/residents/[id]',
  invoke: () =>
    PATCH(
      bffRequest('/api/residents/morador-1', { method: 'PATCH', body: MORADOR }),
      routeParams('morador-1'),
    ),
  upstream: { method: 'PATCH', url: '/residents/morador-1', body: MORADOR },
  apiResponse: { body: { id: 'morador-1', ...MORADOR } },
  successStatus: 200,
})
