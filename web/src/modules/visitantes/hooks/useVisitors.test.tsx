import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildVisitor, buildVisitorsPage } from '@test/factories/visitors'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { renderHookWithProviders } from '@test/render'

import { useVisitors } from './useVisitors'

describe('useVisitors', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('carrega a primeira página e mapeia para VisitorRecord', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        buildVisitorsPage([buildVisitor({ phone: null, vehiclePlate: 'ABC1D23' })], { total: 1 }),
      ),
    )

    const { result } = renderHookWithProviders(() => useVisitors())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(getFetchCall(fetchMock).url).toBe('/api/visitors?page=1&pageSize=10')
    expect(result.current.records).toEqual([
      expect.objectContaining({
        id: 'visitante-1',
        name: 'Joana Fictícia',
        phone: '-',
        vehiclePlate: 'ABC1D23',
        observations: undefined,
      }),
    ])
    expect(result.current.pagination.total).toBe(1)
    expect(result.current.isError).toBe(false)
  })

  it('expõe isError e a mensagem do serviço quando o BFF falha', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Sessão expirada.' }, 401))

    const { result } = renderHookWithProviders(() => useVisitors())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toBe('Sessão expirada.')
    expect(result.current.records).toEqual([])
  })

  it('aplica debounce na busca e volta para a página 1', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    fetchMock.mockImplementation(async () => jsonResponse(buildVisitorsPage([])))

    const { result } = renderHookWithProviders(() => useVisitors())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.handlePageChange(3))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    act(() => result.current.handleSearchChange(' joana '))
    // Antes de 350ms nenhuma nova requisição com search.
    expect(fetchMock).toHaveBeenCalledTimes(3) // página 1 (reset) sem search

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    await waitFor(() =>
      expect(getFetchCall(fetchMock, fetchMock.mock.calls.length - 1).url).toBe(
        '/api/visitors?page=1&pageSize=10&search=joana',
      ),
    )
    vi.useRealTimers()
  })
})
