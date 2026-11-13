import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Authorization } from '@/app/api/authorizations/types'
import { NOVA_AUTORIZACAO } from '@test/factories/payloads'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describeDetailHook, describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useAuthorization } from './useAuthorization'
import { useAuthorizations } from './useAuthorizations'

const AUTORIZACAO: Authorization = {
  ...NOVA_AUTORIZACAO,
  id: 'autorizacao-1',
  personType: 'prestador_servico',
  validFromDate: '2026-11-12',
  validToDate: '2026-11-30',
  phone: null,
  company: null,
  observations: null,
  createdByUserId: null,
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
}

describePaginatedListHook({
  name: 'useAuthorizations',
  useHook: useAuthorizations,
  firstPageUrl: '/api/authorizations?page=1&pageSize=10',
  pageUrl: (page, pageSize) => `/api/authorizations?page=${page}&pageSize=${pageSize}`,
})

describeDetailHook({
  name: 'useAuthorization',
  useHook: useAuthorization,
  bffPath: '/api/authorizations',
  pick: (result) => result.authorization,
})

describe('useAuthorizations (mapeamento)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('formata as datas de validade em pt-BR e traduz o tipo de pessoa', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [AUTORIZACAO],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(useAuthorizations)
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(result.current.records[0]).toMatchObject({
      personType: 'prestador_servico',
      personTypeLabel: 'Prestador de serviço',
      validFromDate: '12/11/2026',
      validToDate: '30/11/2026',
      phone: undefined,
    })
  })
})
