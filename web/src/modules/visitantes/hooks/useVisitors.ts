'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { listVisitors, VisitorsServiceError } from '@/services/visitantes/service'
import type { VisitorRecord, VisitorsPaginationState } from '@/types/visitantes'

export function useVisitors() {
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

  const visitorsQuery = useQuery({
    queryKey: ['visitors', page, pageSize, debouncedSearchTerm],
    queryFn: () => listVisitors(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: VisitorRecord[] = (visitorsQuery.data?.items ?? []).map((item) => ({
    id: item.id,
    name: item.fullName,
    document: item.document,
    unit: item.unit,
    authorizedBy: item.authorizedBy,
    phone: item.phone ?? '-',
    observations: item.observations ?? undefined,
    vehiclePlate: item.vehiclePlate ?? undefined,
    vehicleBrandModel: item.vehicleBrandModel ?? undefined,
    vehicleColor: item.vehicleColor ?? undefined,
  }))

  const pagination: VisitorsPaginationState = visitorsQuery.data?.pagination ?? {
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
    isLoading: visitorsQuery.isPending,
    isFetching: visitorsQuery.isFetching,
    isError: visitorsQuery.isError,
    errorMessage:
      (visitorsQuery.error as VisitorsServiceError | null)?.message ??
      'Erro ao carregar visitantes.',
    refetch: visitorsQuery.refetch,
  }
}
