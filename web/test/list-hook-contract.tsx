import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from './fetch'
import { renderHookWithProviders } from './render'

type PaginatedListHookResult = {
  records: unknown[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
  isLoading: boolean
  isError: boolean
  errorMessage: string
  handlePageChange: (value: number) => void
  handlePageSizeChange: (value: number) => void
}

type ListHookContract = {
  name: string
  useHook: () => PaginatedListHookResult
  /** URL esperada da primeira página, ex.: `/api/residents?page=1&pageSize=10`. */
  firstPageUrl: string
  /** Monta a URL esperada para outra página/tamanho. */
  pageUrl: (page: number, pageSize: number) => string
}

function emptyPage(page = 1, pageSize = 10) {
  return { items: [], pagination: { page, pageSize, total: 0, totalPages: 1 } }
}

/**
 * Contrato dos hooks de listagem paginada (`useResidents`, `useAuthorizations`...):
 * busca a página 1 no BFF, expõe a mensagem de erro do service e reseta para a
 * página 1 quando o tamanho da página muda. O mapeamento de `records` é
 * verificado em cada domínio.
 */
export function describePaginatedListHook(contract: ListHookContract): void {
  const { useHook } = contract

  describe(`${contract.name} (contrato de listagem)`, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
    })

    it('carrega a página 1 com pageSize 10', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse(emptyPage()))

      const { result } = renderHookWithProviders(useHook)

      expect(result.current.isLoading).toBe(true)
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(getFetchCall(fetchMock).url).toBe(contract.firstPageUrl)
      expect(result.current.records).toEqual([])
      expect(result.current.isError).toBe(false)
    })

    it('expõe isError e a mensagem do BFF', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Sessão expirada.' }, 401))

      const { result } = renderHookWithProviders(useHook)

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.errorMessage).toBe('Sessão expirada.')
      expect(result.current.records).toEqual([])
    })

    it('muda de página e volta à página 1 ao trocar o tamanho', async () => {
      fetchMock.mockImplementation(async () => jsonResponse(emptyPage()))

      const { result } = renderHookWithProviders(useHook)
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => result.current.handlePageChange(3))
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
      expect(getFetchCall(fetchMock, 1).url).toBe(contract.pageUrl(3, 10))

      act(() => result.current.handlePageSizeChange(25))
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
      expect(getFetchCall(fetchMock, 2).url).toBe(contract.pageUrl(1, 25))
    })
  })
}

type DetailHookResult = { isLoading: boolean; isError: boolean; errorMessage: string }

type DetailHookContract<TResult extends DetailHookResult> = {
  name: string
  useHook: (id: string) => TResult
  /** Rota do BFF, ex.: `/api/residents`. */
  bffPath: string
  /** Extrai o registro carregado do retorno do hook. */
  pick: (result: TResult) => unknown
}

/**
 * Contrato dos hooks de detalhe (`useResident(id)`...): busca `<bffPath>/<id>`,
 * não dispara sem id e expõe a mensagem de erro (ex.: 404 de outro condomínio).
 */
export function describeDetailHook<TResult extends DetailHookResult>(
  contract: DetailHookContract<TResult>,
): void {
  const { useHook, bffPath, pick } = contract

  describe(`${contract.name} (contrato de detalhe)`, () => {
    let fetchMock: FetchMock

    beforeEach(() => {
      fetchMock = mockFetch()
    })

    it('carrega o registro pelo id', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'reg-1' }))

      const { result } = renderHookWithProviders(() => useHook('reg-1'))

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(getFetchCall(fetchMock).url).toBe(`${bffPath}/reg-1`)
      expect(pick(result.current)).toEqual({ id: 'reg-1' })
    })

    it('não consulta o BFF sem id', () => {
      const { result } = renderHookWithProviders(() => useHook(''))

      expect(fetchMock).not.toHaveBeenCalled()
      expect(pick(result.current)).toBeUndefined()
    })

    it('expõe a mensagem do BFF em 404 (ex.: id de outro condomínio)', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Registro não encontrado.' }, 404))

      const { result } = renderHookWithProviders(() => useHook('reg-condominio-b'))

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.errorMessage).toBe('Registro não encontrado.')
    })
  })
}
