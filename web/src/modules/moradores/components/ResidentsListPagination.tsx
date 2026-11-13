'use client'

import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function ResidentsListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useResidentListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
