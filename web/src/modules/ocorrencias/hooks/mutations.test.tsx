import { NOVA_OCORRENCIA } from '@test/factories/payloads'
import { describeMutationHook, noContentResponse } from '@test/mutation-hook-contract'

import { useCreateOccurrence } from './useCreateOccurrence'
import { useDeleteOccurrence } from './useDeleteOccurrence'
import { useUpdateOccurrence } from './useUpdateOccurrence'

const INVALIDA = ['incidents', 'reports'] as const

describeMutationHook({
  name: 'useCreateOccurrence',
  useHook: useCreateOccurrence,
  variables: NOVA_OCORRENCIA,
  upstream: { method: 'POST', url: '/api/incidents' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useUpdateOccurrence',
  useHook: () => useUpdateOccurrence('ocorrencia-1'),
  variables: NOVA_OCORRENCIA,
  upstream: { method: 'PATCH', url: '/api/incidents/ocorrencia-1' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useDeleteOccurrence',
  useHook: useDeleteOccurrence,
  variables: 'ocorrencia-1',
  upstream: { method: 'DELETE', url: '/api/incidents/ocorrencia-1' },
  successResponse: noContentResponse,
  invalidates: INVALIDA,
})
