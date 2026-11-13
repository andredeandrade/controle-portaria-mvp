'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { listEvents, EventsServiceError } from '@/services/eventos/service'
import type { EventRecord, EventsPaginationState } from '@/types/eventos'

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function formatTimeRange(startTime: string, endTime: string | null): string {
  if (!endTime) {
    return startTime
  }

  return `${startTime} às ${endTime}`
}

export function useEvents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchTerm])

  const eventsQuery = useQuery({
    queryKey: ['events', page, pageSize, debouncedSearchTerm],
    queryFn: () => listEvents(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: EventRecord[] = (eventsQuery.data?.items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    date: formatDate(item.date),
    time: formatTimeRange(item.startTime, item.endTime),
    unit: item.unit,
    space: item.space ?? '',
    responsibleName: item.responsibleName,
    guestsCount: item.guests.length,
  }))

  const pagination: EventsPaginationState = eventsQuery.data?.pagination ?? {
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  }

  const handleSearchChange = (value: string) => {
    setPage(1)
    setSearchTerm(value)
  }

  const handlePageChange = (value: number) => {
    setPage(value)
  }

  const handlePageSizeChange = (value: number) => {
    setPage(1)
    setPageSize(value)
  }

  return {
    records,
    pagination,
    searchTerm,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    isLoading: eventsQuery.isPending,
    isFetching: eventsQuery.isFetching,
    isError: eventsQuery.isError,
    errorMessage:
      (eventsQuery.error as EventsServiceError | null)?.message ?? 'Erro ao carregar eventos.',
    refetch: eventsQuery.refetch,
  }
}
