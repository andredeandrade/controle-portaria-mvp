// Hook para buscar e filtrar ocorrências
'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { IncidentsServiceError, listIncidents } from '@/services/ocorrencias/service'
import {
  OCCURRENCE_TYPE_LABEL,
  OccurrenceTypeEnum,
  type OccurrenceRecord,
  type OccurrencesPaginationState,
} from '@/types/ocorrencias'

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function useOccurrences() {
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

  const incidentsQuery = useQuery({
    queryKey: ['incidents', page, pageSize, debouncedSearchTerm],
    queryFn: () => listIncidents(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: OccurrenceRecord[] = (incidentsQuery.data?.items ?? []).map((item) => {
    const type = item.occurrenceType as OccurrenceTypeEnum
    const occurrenceTypeLabel = OCCURRENCE_TYPE_LABEL[type] ?? item.occurrenceType

    return {
      id: item.id,
      occurrenceType: item.occurrenceType,
      occurrenceTypeLabel,
      date: formatDate(item.date),
      time: item.time,
      place: item.place ?? '—',
      report: item.report,
      createdByUserName: item.createdByUserName ?? '—',
    }
  })

  const pagination: OccurrencesPaginationState = incidentsQuery.data?.pagination ?? {
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
    isLoading: incidentsQuery.isPending,
    isFetching: incidentsQuery.isFetching,
    isError: incidentsQuery.isError,
    errorMessage:
      (incidentsQuery.error as IncidentsServiceError | null)?.message ??
      'Erro ao carregar ocorrencias.',
    refetch: incidentsQuery.refetch,
  }
}
