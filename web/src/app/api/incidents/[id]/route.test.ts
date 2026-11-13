import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract, routeParams } from '@test/bff-route-contract'

import { DELETE, GET, PATCH } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const OCORRENCIA = {
  occurrenceType: 'Barulho',
  date: '2026-11-12',
  time: '23:10',
  report: 'Relato fictício.',
  place: 'Salão de festas',
}
const COMUM = {
  unauthenticatedMessage: 'Nao autenticado.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de ocorrencias.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/incidents/[id]',
  invoke: () => GET(bffRequest('/api/incidents/ocorrencia-1'), routeParams('ocorrencia-1')),
  upstream: { method: 'GET', url: '/incidents/ocorrencia-1' },
  apiResponse: { body: { id: 'ocorrencia-1', ...OCORRENCIA } },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'PATCH /api/incidents/[id]',
  invoke: () =>
    PATCH(
      bffRequest('/api/incidents/ocorrencia-1', { method: 'PATCH', body: OCORRENCIA }),
      routeParams('ocorrencia-1'),
    ),
  upstream: { method: 'PATCH', url: '/incidents/ocorrencia-1', body: OCORRENCIA },
  apiResponse: { body: { id: 'ocorrencia-1', ...OCORRENCIA } },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/incidents/[id]',
  invoke: () =>
    DELETE(
      bffRequest('/api/incidents/ocorrencia-1', { method: 'DELETE' }),
      routeParams('ocorrencia-1'),
    ),
  upstream: { method: 'DELETE', url: '/incidents/ocorrencia-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})
