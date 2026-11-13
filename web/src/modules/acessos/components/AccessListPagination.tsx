'use client'

import { useAccessListContext } from '@/modules/acessos/context/AccessListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function AccessListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useAccessListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
