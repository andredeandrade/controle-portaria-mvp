import { vi } from 'vitest'

import { bffRequest, describeProtectedRouteContract } from '@test/bff-route-contract'

import { DELETE, GET, POST } from './route'

vi.mock('next/headers', async () => (await import('@test/next-headers')).nextHeadersMock)

const EVENTO = {
  title: 'Aniversário Fictício',
  date: '2026-12-01',
  startTime: '19:00',
  unit: 'Bloco A - 101',
  responsibleName: 'Morador Fictício',
  guests: [{ name: 'Convidado Fictício' }],
}
const COMUM = {
  unauthenticatedMessage: 'Não autenticado.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de eventos.',
}

describeProtectedRouteContract({
  ...COMUM,
  name: 'GET /api/events',
  invoke: () => GET(bffRequest('/api/events')),
  upstream: { method: 'GET', url: '/events?page=1&pageSize=10' },
  apiResponse: {
    body: { items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 } },
  },
  successStatus: 200,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'POST /api/events',
  invoke: () => POST(bffRequest('/api/events', { method: 'POST', body: EVENTO })),
  upstream: { method: 'POST', url: '/events', body: EVENTO },
  apiResponse: { body: { id: 'evento-1', ...EVENTO }, status: 201 },
  successStatus: 201,
})

describeProtectedRouteContract({
  ...COMUM,
  name: 'DELETE /api/events',
  invoke: () => DELETE(bffRequest('/api/events', { method: 'DELETE', body: { id: 'evento-1' } })),
  upstream: { method: 'DELETE', url: '/events/evento-1' },
  apiResponse: { body: null, status: 204 },
  successStatus: 204,
})
