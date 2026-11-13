'use client'

import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function EventsListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useEventListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
