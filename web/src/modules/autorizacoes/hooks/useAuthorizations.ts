// Hook para buscar e filtrar autorizações
'use client'

import type { PersonTypeValue } from '@/modules/form/components/PersonTypeSelect'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { AuthorizationsServiceError, listAuthorizations } from '@/services/autorizacoes/service'
import {
  PERSON_TYPE_LABEL,
  type AuthorizationRecord,
  type AuthorizationsPaginationState,
} from '@/types/autorizacoes'

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function useAuthorizations() {
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

  const authorizationsQuery = useQuery({
    queryKey: ['authorizations', page, pageSize, debouncedSearchTerm],
    queryFn: () => listAuthorizations(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: AuthorizationRecord[] = (authorizationsQuery.data?.items ?? []).map((item) => {
    const personType = item.personType as PersonTypeValue

    return {
      id: item.id,
      authorizedName: item.authorizedName,
      personType: item.personType,
      personTypeLabel: PERSON_TYPE_LABEL[personType] ?? item.personType,
      document: item.document,
      phone: item.phone ?? undefined,
      company: item.company ?? undefined,
      observations: item.observations ?? undefined,
      validFromDate: formatDate(item.validFromDate),
      validFromTime: item.validFromTime,
      validToDate: formatDate(item.validToDate),
      validToTime: item.validToTime,
      unit: item.unit,
      authorizedBy: item.authorizedBy,
    }
  })

  const pagination: AuthorizationsPaginationState = authorizationsQuery.data?.pagination ?? {
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
    isLoading: authorizationsQuery.isPending,
    isFetching: authorizationsQuery.isFetching,
    isError: authorizationsQuery.isError,
    errorMessage:
      (authorizationsQuery.error as AuthorizationsServiceError | null)?.message ??
      'Erro ao carregar autorizacoes.',
    refetch: authorizationsQuery.refetch,
  }
}
