import { NOVO_PRESTADOR } from '@test/factories/payloads'
import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useCreateServiceProvider } from './useCreateServiceProvider'
import { useDeleteServiceProvider } from './useDeleteServiceProvider'
import { useUpdateServiceProvider } from './useUpdateServiceProvider'

const INVALIDA = ['service-providers', 'reports', 'person-search'] as const

describeMutationHook({
  name: 'useCreateServiceProvider',
  useHook: useCreateServiceProvider,
  variables: NOVO_PRESTADOR,
  upstream: { method: 'POST', url: '/api/service-providers' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useUpdateServiceProvider',
  useHook: () => useUpdateServiceProvider('prestador-1'),
  variables: NOVO_PRESTADOR,
  upstream: { method: 'PATCH', url: '/api/service-providers/prestador-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteServiceProvider',
  useHook: useDeleteServiceProvider,
  variables: 'prestador-1',
  upstream: { method: 'DELETE', url: '/api/service-providers' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})
