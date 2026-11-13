'use client'

import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function VisitorsListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useVisitorListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
