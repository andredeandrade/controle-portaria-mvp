import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract, routeParams } from '@test/bff-route-contract'
import { buildVisitor } from '@test/factories/visitors'

import { GET, PATCH } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const VISITANTE = {
  fullName: 'Joana Fictícia',
  document: '12345678',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
  vehiclePlate: 'ABC1D23',
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de visitantes.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/visitors/[id]',
  invoke: () => GET(bffRequest('/api/visitors/visitante-1'), routeParams('visitante-1')),
  upstream: { method: 'GET', url: '/visitors/visitante-1' },
  apiResponse: { body: buildVisitor() },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'PATCH /api/visitors/[id]',
  invoke: () =>
    PATCH(
      bffRequest('/api/visitors/visitante-1', { method: 'PATCH', body: VISITANTE }),
      routeParams('visitante-1'),
    ),
  upstream: { method: 'PATCH', url: '/visitors/visitante-1', body: VISITANTE },
  apiResponse: { body: buildVisitor(VISITANTE) },
  successStatus: 200,
})
