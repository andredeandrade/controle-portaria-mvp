'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  listServiceProviders,
  ServiceProvidersServiceError,
} from '@/services/prestadores-servicos/service'
import type {
  ServiceProviderRecord,
  ServiceProvidersPaginationState,
} from '@/types/prestadores-servicos'

export function useServiceProviders() {
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

  const serviceProvidersQuery = useQuery({
    queryKey: ['service-providers', page, pageSize, debouncedSearchTerm],
    queryFn: () => listServiceProviders(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: ServiceProviderRecord[] = (serviceProvidersQuery.data?.items ?? []).map(
    (item) => ({
      id: item.id,
      companyName: item.companyName,
      responsibleName: item.responsibleName,
      document: item.document,
      serviceType: item.serviceType,
      phone: item.phone ?? '-',
      unit: item.unit ?? undefined,
      authorizedBy: item.authorizedBy,
      email: item.email ?? undefined,
      observations: item.observations ?? undefined,
      vehiclePlate: item.vehiclePlate ?? undefined,
      vehicleBrandModel: item.vehicleBrandModel ?? undefined,
      vehicleColor: item.vehicleColor ?? undefined,
    }),
  )

  const pagination: ServiceProvidersPaginationState = serviceProvidersQuery.data?.pagination ?? {
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
    isLoading: serviceProvidersQuery.isPending,
    isFetching: serviceProvidersQuery.isFetching,
    isError: serviceProvidersQuery.isError,
    errorMessage:
      (serviceProvidersQuery.error as ServiceProvidersServiceError | null)?.message ??
      'Erro ao carregar prestadores.',
    refetch: serviceProvidersQuery.refetch,
  }
}
