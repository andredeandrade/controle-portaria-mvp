import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useDeleteVisitor } from './useDeleteVisitor'
import { useUpdateVisitor } from './useUpdateVisitor'

// `useCreateVisitor` tem teste próprio em `useCreateVisitor.test.tsx`.
const INVALIDA = ['visitors', 'reports', 'person-search'] as const

describeMutationHook({
  name: 'useUpdateVisitor',
  useHook: () => useUpdateVisitor('visitante-1'),
  variables: {
    fullName: 'Joana Fictícia',
    document: '12345678',
    unit: 'Bloco A - 101',
    authorizedBy: 'Morador Fictício',
  },
  upstream: { method: 'PATCH', url: '/api/visitors/visitante-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteVisitor',
  useHook: useDeleteVisitor,
  variables: 'visitante-1',
  upstream: { method: 'DELETE', url: '/api/visitors' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})
