'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { listResidents, ResidentsServiceError } from '@/services/moradores/service'
import {
  RESIDENT_RELATION_LABEL,
  type ResidentRecord,
  ResidentRelationEnum,
  type ResidentsPaginationState,
  VEHICLE_TYPE_LABEL,
  VehicleTypeEnum,
} from '@/types/moradores'

export function useResidents() {
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

  const residentsQuery = useQuery({
    queryKey: ['residents', page, pageSize, debouncedSearchTerm],
    queryFn: () => listResidents(page, pageSize, debouncedSearchTerm),
    placeholderData: keepPreviousData,
  })

  const records: ResidentRecord[] = (residentsQuery.data?.items ?? []).map((item) => ({
    id: item.id,
    name: item.fullName,
    document: item.document ?? undefined,
    units: item.units,
    relation: RESIDENT_RELATION_LABEL[item.relation as ResidentRelationEnum] ?? item.relation,
    phone: item.phone ?? '-',
    email: item.email ?? undefined,
    observations: item.observations ?? undefined,
    vehicles: item.vehicles.map((vehicle) => ({
      id: vehicle.id,
      type: VEHICLE_TYPE_LABEL[vehicle.type as VehicleTypeEnum] ?? vehicle.type,
      plate: vehicle.plate ?? '-',
      color: vehicle.color ?? undefined,
      brandModel: vehicle.brandModel ?? undefined,
    })),
  }))

  const pagination: ResidentsPaginationState = residentsQuery.data?.pagination ?? {
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
    isLoading: residentsQuery.isPending,
    isFetching: residentsQuery.isFetching,
    isError: residentsQuery.isError,
    errorMessage:
      (residentsQuery.error as ResidentsServiceError | null)?.message ??
      'Erro ao carregar moradores.',
    refetch: residentsQuery.refetch,
  }
}
