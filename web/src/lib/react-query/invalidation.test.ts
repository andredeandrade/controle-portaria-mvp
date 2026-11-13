import { QueryClient, type QueryKey } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import { invalidateDomainQueries, type DomainQueryKey } from './invalidation'

const ESPERADO: Record<DomainQueryKey, QueryKey[]> = {
  'access-records': [['access-records'], ['dashboard'], ['reports']],
  authorizations: [['authorizations'], ['dashboard'], ['reports'], ['person-search']],
  events: [['events'], ['dashboard'], ['reports']],
  incidents: [['incidents'], ['reports']],
  residents: [['residents'], ['reports'], ['person-search']],
  'service-providers': [['service-providers'], ['reports'], ['person-search']],
  visitors: [['visitors'], ['reports'], ['person-search']],
}

describe('invalidateDomainQueries', () => {
  it.each(Object.entries(ESPERADO) as [DomainQueryKey, QueryKey[]][])(
    '%s invalida a listagem e as queries derivadas por prefixo',
    async (domain, expected) => {
      const queryClient = new QueryClient()
      const spy = vi.spyOn(queryClient, 'invalidateQueries')

      await invalidateDomainQueries(queryClient, domain)

      expect(spy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual(expected)
    },
  )

  it('invalida chaves compostas pelo prefixo e preserva outros domínios', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['residents', 2, 10, 'carlos'], { items: [] })
    queryClient.setQueryData(['residents', 'morador-1'], { id: 'morador-1' })
    queryClient.setQueryData(['visitors', 1, 10, ''], { items: [] })
    queryClient.setQueryData(['auth', 'me'], { user: {} })

    await invalidateDomainQueries(queryClient, 'residents')

    expect(queryClient.getQueryState(['residents', 2, 10, 'carlos'])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['residents', 'morador-1'])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['visitors', 1, 10, ''])?.isInvalidated).toBe(false)
    expect(queryClient.getQueryState(['auth', 'me'])?.isInvalidated).toBe(false)
  })
})
