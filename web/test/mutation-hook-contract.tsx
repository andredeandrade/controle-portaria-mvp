import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from './fetch'
import { createTestQueryClient, renderHookWithProviders } from './render'

/** Prefixos de query key usados no app; todos são semeados antes de cada mutation. */
const ALL_PREFIXES = [
  'access-records',
  'authorizations',
  'events',
  'incidents',
  'residents',
  'service-providers',
  'visitors',
  'dashboard',
  'reports',
  'person-search',
  'auth',
] as const

type QueryPrefix = (typeof ALL_PREFIXES)[number]

type MutationHookContract<TData, TError extends Error, TVariables> = {
  name: string
  useHook: () => UseMutationResult<TData, TError, TVariables>
  variables: TVariables
  /** Chamada esperada ao BFF. */
  upstream: { method: string; url: string }
  /** Resposta do BFF no caminho feliz (padrão: `{ id: 'registro-1' }`). */
  successResponse?: () => Response
  /** Prefixos que DEVEM ser invalidados; todos os outros devem ficar intactos. */
  invalidates: readonly QueryPrefix[]
}

function seedQueries(): QueryClient {
  const queryClient = createTestQueryClient()

  for (const prefix of ALL_PREFIXES) {
    queryClient.setQueryData([prefix, 'semente', 1], { semente: true })
  }

  return queryClient
}

function invalidatedPrefixes(queryClient: QueryClient): QueryPrefix[] {
  return ALL_PREFIXES.filter(
    (prefix) => queryClient.getQueryState([prefix, 'semente', 1])?.isInvalidated === true,
  )
}

/**
 * Contrato dos hooks `useCreateX`/`useUpdateX`/`useDeleteX`/ações: chamam o
 * service (fetch ao BFF é a fronteira mockada), invalidam por **prefixo** as
 * queries do domínio e derivadas em sucesso, e não tocam no cache em erro.
 */
export function describeMutationHook<TData, TError extends Error, TVariables>(
  contract: MutationHookContract<TData, TError, TVariables>,
): void {
  const { useHook, variables, upstream } = contract

  describe(contract.name, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
    })

    it(`chama ${upstream.method} ${upstream.url} e invalida [${contract.invalidates.join(', ')}]`, async () => {
      fetchMock.mockResolvedValueOnce(
        contract.successResponse?.() ?? jsonResponse({ id: 'registro-1' }),
      )
      const queryClient = seedQueries()

      const { result } = renderHookWithProviders(useHook, { queryClient })

      await act(async () => {
        await result.current.mutateAsync(variables)
      })

      const call = getFetchCall(fetchMock)
      expect(call.url).toBe(upstream.url)
      expect(call.init.method).toBe(upstream.method)
      expect(invalidatedPrefixes(queryClient)).toEqual(
        [...contract.invalidates].sort(byPrefixOrder),
      )
    })

    it('expõe a mensagem de erro do BFF e não invalida nada', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Operação recusada.' }, 409))
      const queryClient = seedQueries()

      const { result } = renderHookWithProviders(useHook, { queryClient })

      act(() => result.current.mutate(variables))

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toBe('Operação recusada.')
      expect(invalidatedPrefixes(queryClient)).toEqual([])
    })
  })
}

function byPrefixOrder(a: QueryPrefix, b: QueryPrefix): number {
  return ALL_PREFIXES.indexOf(a) - ALL_PREFIXES.indexOf(b)
}

/** Resposta 204 sem corpo, como os `DELETE` do BFF. */
export function noContentResponse(): Response {
  return new Response(null, { status: 204 })
}
