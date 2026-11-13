import { NOVO_MORADOR } from '@test/factories/payloads'
import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useCreateResident } from './useCreateResident'
import { useDeleteResident } from './useDeleteResident'
import { useUpdateResident } from './useUpdateResident'

const INVALIDA = ['residents', 'reports', 'person-search'] as const

describeMutationHook({
  name: 'useCreateResident',
  useHook: useCreateResident,
  variables: NOVO_MORADOR,
  upstream: { method: 'POST', url: '/api/residents' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useUpdateResident',
  useHook: () => useUpdateResident('morador-1'),
  variables: NOVO_MORADOR,
  upstream: { method: 'PATCH', url: '/api/residents/morador-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteResident',
  useHook: useDeleteResident,
  variables: 'morador-1',
  upstream: { method: 'DELETE', url: '/api/residents' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})
