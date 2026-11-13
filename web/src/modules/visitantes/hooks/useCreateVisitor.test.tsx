import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CreateVisitorRequest } from '@/app/api/visitors/types'
import { buildVisitor } from '@test/factories/visitors'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { createTestQueryClient, renderHookWithProviders } from '@test/render'

import { useCreateVisitor } from './useCreateVisitor'

const PAYLOAD: CreateVisitorRequest = {
  fullName: 'Joana Fictícia',
  document: '12345678',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
}

function seedQueries() {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(['visitors', 1, 10, ''], { items: [] })
  queryClient.setQueryData(['reports', 'counts'], { total: 0 })
  queryClient.setQueryData(['person-search', 'joana'], [])
  queryClient.setQueryData(['residents', 1, 10, ''], { items: [] })
  return queryClient
}

describe('useCreateVisitor', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('cadastra e invalida visitors, reports e person-search (sem tocar em residents)', async () => {
    const created = buildVisitor()
    fetchMock.mockResolvedValueOnce(jsonResponse(created, 201))
    const queryClient = seedQueries()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useCreateVisitor(), { queryClient })

    let returned: unknown
    await act(async () => {
      returned = await result.current.mutateAsync(PAYLOAD)
    })

    expect(returned).toEqual(created)
    expect(invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['visitors'],
      ['reports'],
      ['person-search'],
    ])
    expect(queryClient.getQueryState(['visitors', 1, 10, ''])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['reports', 'counts'])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['person-search', 'joana'])?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(['residents', 1, 10, ''])?.isInvalidated).toBe(false)
  })

  it('expõe o erro do serviço e não invalida o cache em falha', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Documento já cadastrado.' }, 409))
    const queryClient = seedQueries()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHookWithProviders(() => useCreateVisitor(), { queryClient })

    act(() => result.current.mutate(PAYLOAD))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Documento já cadastrado.')
    expect(invalidateSpy).not.toHaveBeenCalled()
    expect(queryClient.getQueryState(['visitors', 1, 10, ''])?.isInvalidated).toBe(false)
  })
})
