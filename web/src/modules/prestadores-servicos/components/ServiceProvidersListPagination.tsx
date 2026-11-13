'use client'

import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { ListPagination } from '@/modules/table/components/ListPagination'

export function ServiceProvidersListPagination() {
  const { pagination, handlePageChange, isLoading, isFetching } = useServiceProviderListContext()

  return (
    <ListPagination
      pagination={pagination}
      onPageChange={handlePageChange}
      disabled={isLoading || isFetching}
    />
  )
}
