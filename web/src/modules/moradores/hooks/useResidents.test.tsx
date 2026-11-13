import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Resident } from '@/app/api/residents/types'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describeDetailHook, describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useResident } from './useResident'
import { useResidents } from './useResidents'

const MORADOR: Resident = {
  id: 'morador-1',
  fullName: 'Carlos Fictício',
  units: ['Bloco B - 202', 'Bloco B - 203'],
  relation: 'inquilino',
  email: null,
  phone: null,
  document: '98765432',
  observations: null,
  vehicles: [{ id: 'veiculo-1', type: 'moto', color: null, plate: null, brandModel: 'Moto X' }],
  createdByUserId: 'usuario-1',
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-10T12:00:00.000Z',
}

describePaginatedListHook({
  name: 'useResidents',
  useHook: useResidents,
  firstPageUrl: '/api/residents?page=1&pageSize=10',
  pageUrl: (page, pageSize) => `/api/residents?page=${page}&pageSize=${pageSize}`,
})

describeDetailHook({
  name: 'useResident',
  useHook: useResident,
  bffPath: '/api/residents',
  pick: (result) => result.resident,
})

describe('useResidents (mapeamento)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('traduz vínculo e tipo de veículo para rótulos e preenche ausências', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [MORADOR],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(useResidents)
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(result.current.records[0]).toEqual({
      id: 'morador-1',
      name: 'Carlos Fictício',
      document: '98765432',
      units: ['Bloco B - 202', 'Bloco B - 203'],
      relation: 'Inquilino',
      phone: '-',
      email: undefined,
      observations: undefined,
      vehicles: [
        { id: 'veiculo-1', type: 'Moto', plate: '-', color: undefined, brandModel: 'Moto X' },
      ],
    })
  })
})
