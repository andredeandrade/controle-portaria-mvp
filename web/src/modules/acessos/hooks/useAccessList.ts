'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { AccessRecordsServiceError, listAccessRecords } from '@/services/acessos/service'
import {
  type AccessListViewMode,
  type AccessRecordListItem,
  type AccessRecordsPaginationState,
  formatAccessRecord,
} from '@/types/acessos'

type UseAccessListParams = {
  viewMode: AccessListViewMode
}

export type AccessRecord = AccessRecordListItem

const VIEW_MODE_API_STATUS: Record<AccessListViewMode, 'all' | 'open' | 'closed'> = {
  all: 'all',
  active: 'open',
  exited: 'closed',
}

export function useAccessList({ viewMode }: UseAccessListParams) {
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

  const apiStatus = VIEW_MODE_API_STATUS[viewMode]

  const accessRecordsQuery = useQuery({
    queryKey: ['access-records', page, pageSize, debouncedSearchTerm, apiStatus],
    queryFn: () => listAccessRecords(page, pageSize, debouncedSearchTerm, apiStatus),
    placeholderData: keepPreviousData,
  })

  const records: AccessRecord[] = (accessRecordsQuery.data?.items ?? []).map(formatAccessRecord)

  const pagination: AccessRecordsPaginationState = accessRecordsQuery.data?.pagination ?? {
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
    isLoading: accessRecordsQuery.isPending,
    isFetching: accessRecordsQuery.isFetching,
    isError: accessRecordsQuery.isError,
    errorMessage:
      (accessRecordsQuery.error as AccessRecordsServiceError | null)?.message ??
      'Erro ao carregar registros de acesso.',
    refetch: accessRecordsQuery.refetch,
  }
}
