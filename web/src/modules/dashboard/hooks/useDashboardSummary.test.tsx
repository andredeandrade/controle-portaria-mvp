import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderHookWithProviders } from '@test/render'

import { useDashboardSummary } from './useDashboardSummary'

describe('useDashboardSummary', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('carrega o resumo do período sob a chave ["dashboard", "summary", período]', async () => {
    const resumo = { totalActiveAccesses: 4, totalAuthorizations: 2, totalEvents: 1 }
    fetchMock.mockResolvedValueOnce(jsonResponse(resumo))

    const { result, queryClient } = renderHookWithProviders(() => useDashboardSummary('month'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(resumo)
    expect(getFetchCall(fetchMock).url).toBe('/api/dashboard?period=month')
    expect(queryClient.getQueryData(['dashboard', 'summary', 'month'])).toEqual(resumo)
  })

  it('expõe o erro do service', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Sem permissão.' }, 403))

    const { result } = renderHookWithProviders(() => useDashboardSummary('today'))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Sem permissão.')
  })
})
