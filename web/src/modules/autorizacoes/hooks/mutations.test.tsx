import { NOVA_AUTORIZACAO } from '@test/factories/payloads'
import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useCreateAuthorization } from './useCreateAuthorization'
import { useDeleteAuthorization } from './useDeleteAuthorization'
import { useUpdateAuthorization } from './useUpdateAuthorization'

// Autorizações alimentam o dashboard e a busca de pessoas do registro de acesso.
const INVALIDA = ['authorizations', 'dashboard', 'reports', 'person-search'] as const

describeMutationHook({
  name: 'useCreateAuthorization',
  useHook: useCreateAuthorization,
  variables: NOVA_AUTORIZACAO,
  upstream: { method: 'POST', url: '/api/authorizations' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useUpdateAuthorization',
  useHook: () => useUpdateAuthorization('autorizacao-1'),
  variables: NOVA_AUTORIZACAO,
  upstream: { method: 'PATCH', url: '/api/authorizations/autorizacao-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteAuthorization',
  useHook: useDeleteAuthorization,
  variables: 'autorizacao-1',
  upstream: { method: 'DELETE', url: '/api/authorizations' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})
