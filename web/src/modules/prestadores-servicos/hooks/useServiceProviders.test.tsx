import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { ServiceProvider } from '@/app/api/service-providers/types'
import { NOVO_PRESTADOR } from '@test/factories/payloads'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describeDetailHook, describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useServiceProvider } from './useServiceProvider'
import { useServiceProviders } from './useServiceProviders'

const PRESTADOR: ServiceProvider = {
  ...NOVO_PRESTADOR,
  id: 'prestador-1',
  phone: null,
  email: null,
  unit: null,
  observations: null,
  vehiclePlate: 'XYZ9A87',
  vehicleBrandModel: null,
  vehicleColor: null,
  createdByUserId: null,
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
}

describePaginatedListHook({
  name: 'useServiceProviders',
  useHook: useServiceProviders,
  firstPageUrl: '/api/service-providers?page=1&pageSize=10',
  pageUrl: (page, pageSize) => `/api/service-providers?page=${page}&pageSize=${pageSize}`,
})

describeDetailHook({
  name: 'useServiceProvider',
  useHook: useServiceProvider,
  bffPath: '/api/service-providers',
  pick: (result) => result.serviceProvider,
})

describe('useServiceProviders (mapeamento)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('preenche telefone ausente com "-" e converte nulos em undefined', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [PRESTADOR],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(useServiceProviders)
    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(result.current.records[0]).toMatchObject({
      companyName: 'Empresa Fictícia Ltda',
      phone: '-',
      unit: undefined,
      email: undefined,
      vehiclePlate: 'XYZ9A87',
    })
  })
})
