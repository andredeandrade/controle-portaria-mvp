import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { AccessListViewMode } from '@/types/acessos'
import { buildAccessRecord } from '@test/factories/access-records'
import { getFetchCall, jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useAccessList } from './useAccessList'

describePaginatedListHook({
  name: 'useAccessList',
  useHook: () => useAccessList({ viewMode: 'all' }),
  firstPageUrl: '/api/access-records?page=1&pageSize=10&status=all',
  pageUrl: (page, pageSize) => `/api/access-records?page=${page}&pageSize=${pageSize}&status=all`,
})

describe('useAccessList (modo de visualização)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it.each<[AccessListViewMode, string]>([
    ['active', 'open'],
    ['exited', 'closed'],
  ])('viewMode=%s consulta status=%s', async (viewMode, status) => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [buildAccessRecord()],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(() => useAccessList({ viewMode }))
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(getFetchCall(fetchMock).url).toBe(
      `/api/access-records?page=1&pageSize=10&status=${status}`,
    )
    expect(result.current.records[0]).toMatchObject({ id: 'acesso-1', name: 'Joana Fictícia' })
  })
})
