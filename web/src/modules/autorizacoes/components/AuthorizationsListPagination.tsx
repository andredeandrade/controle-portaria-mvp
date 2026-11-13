'use client'

import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function AuthorizationsListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useAuthorizationListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
