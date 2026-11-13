import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Event, EventGuest } from '@/app/api/events/types'
import { jsonResponse, mockFetch, type FetchMock } from '@test/fetch'
import { describeDetailHook, describePaginatedListHook } from '@test/list-hook-contract'
import { renderHookWithProviders } from '@test/render'

import { useEvent } from './useEvent'
import { useEvents } from './useEvents'

describePaginatedListHook({
  name: 'useEvents',
  useHook: useEvents,
  firstPageUrl: '/api/events?page=1&pageSize=10',
  pageUrl: (page, pageSize) => `/api/events?page=${page}&pageSize=${pageSize}`,
})

describeDetailHook({
  name: 'useEvent',
  useHook: useEvent,
  bffPath: '/api/events',
  pick: (result) => result.event,
})

describe('useEvents (mapeamento)', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = mockFetch()
  })

  it('formata data e faixa de horário e conta convidados', async () => {
    const convidado = (id: string): EventGuest => ({
      id,
      name: `Convidado ${id}`,
      document: null,
      isAdHoc: false,
      entryVehicle: null,
      exitVehicle: null,
      checkInAt: null,
      checkOutAt: null,
    })
    const evento: Event = {
      id: 'evento-1',
      title: 'Aniversário Fictício',
      date: '2026-12-01',
      startTime: '19:00',
      endTime: '23:00',
      unit: 'Bloco A - 101',
      space: null,
      responsibleName: 'Morador Fictício',
      guests: [convidado('g-1'), convidado('g-2')],
      vehicles: [],
      observations: null,
      createdByUserId: null,
      createdAt: '2026-11-01T12:00:00.000Z',
      updatedAt: '2026-11-01T12:00:00.000Z',
    }
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [evento, { ...evento, id: 'evento-2', endTime: null, guests: [] }],
        pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
      }),
    )

    const { result } = renderHookWithProviders(useEvents)
    await waitFor(() => expect(result.current.records).toHaveLength(2))

    expect(result.current.records).toEqual([
      expect.objectContaining({
        date: '01/12/2026',
        time: '19:00 às 23:00',
        space: '',
        guestsCount: 2,
      }),
      expect.objectContaining({ time: '19:00', guestsCount: 0 }),
    ])
  })
})
