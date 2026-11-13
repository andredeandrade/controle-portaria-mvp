import { NOVA_ENTRADA } from '@test/factories/payloads'
import { describeMutationHook } from '@test/mutation-hook-contract'

import { useCheckOutAccessRecord } from './useCheckOutAccessRecord'
import { useCreateAccessRecord } from './useCreateAccessRecord'

// Entrada/saída mudam "acessos ativos" no dashboard.
const INVALIDA = ['access-records', 'dashboard', 'reports'] as const

describeMutationHook({
  name: 'useCreateAccessRecord',
  useHook: useCreateAccessRecord,
  variables: NOVA_ENTRADA,
  upstream: { method: 'POST', url: '/api/access-records' },
  invalidates: INVALIDA,
})

describeMutationHook({
  name: 'useCheckOutAccessRecord',
  useHook: useCheckOutAccessRecord,
  variables: { id: 'acesso-1', personIds: ['pessoa-1'] },
  upstream: { method: 'POST', url: '/api/access-records/check-out' },
  invalidates: INVALIDA,
})
