import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Incident } from '@/app/api/incidents/types'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describeDetailHook, describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useOccurrence } from './useOccurrence'
import { useOccurrences } from './useOccurrences'

const OCORRENCIA: Incident = {
  id: 'ocorrencia-1',
  occurrenceType: 'falta_agua',
  date: '2026-11-12',
  time: '23:10',
  report: 'Relato fictício.',
  place: null,
  createdByUserId: null,
  createdByUserName: null,
  createdAt: '2026-11-12T23:10:00.000Z',
  updatedAt: '2026-11-12T23:10:00.000Z',
}

describePaginatedListHook({
  name: 'useOccurrences',
  useHook: useOccurrences,
  firstPageUrl: '/api/incidents?page=1&pageSize=10',
  pageUrl: (page, pageSize) => `/api/incidents?page=${page}&pageSize=${pageSize}`,
})

describeDetailHook({
  name: 'useOccurrence',
  useHook: useOccurrence,
  bffPath: '/api/incidents',
  pick: (result) => result.occurrence,
})

describe('useOccurrences (mapeamento)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('traduz o tipo, formata a data e preenche local/autor ausentes', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [OCORRENCIA],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(useOccurrences)
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(result.current.records[0]).toEqual({
      id: 'ocorrencia-1',
      occurrenceType: 'falta_agua',
      occurrenceTypeLabel: 'Falta de agua',
      date: '12/11/2026',
      time: '23:10',
      place: '—',
      report: 'Relato fictício.',
      createdByUserName: '—',
    })
  })
})
