'use client'

import type { ReactNode } from 'react'

import {
  ServiceProviderListContext,
  type ServiceProviderListContextValue,
} from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { useDeleteServiceProvider } from '@/modules/prestadores-servicos/hooks/useDeleteServiceProvider'
import { useServiceProviders } from '@/modules/prestadores-servicos/hooks/useServiceProviders'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { ServiceProviderRecord } from '@/types/prestadores-servicos'

type ServiceProviderListProviderProps = {
  children: ReactNode
}

export function ServiceProviderListProvider({ children }: ServiceProviderListProviderProps) {
  const query = useServiceProviders()
  const selection = useListSelection<ServiceProviderRecord>()
  const viewSelection = useListSelection<ServiceProviderRecord>()
  const deleteMutation = useDeleteServiceProvider()

  const handleClearFilters = () => {
    query.handleSearchChange('')
  }

  const handleConfirmDelete = async () => {
    if (!selection.selectedItem) {
      return
    }

    await deleteMutation.mutateAsync(selection.selectedItem.id)
  }

  // O value não é memoizado propositalmente: records/isFetching mudam a cada
  // fetch e os handlers vêm de hooks que já recriam suas referências a cada
  // render, então um useMemo aqui não evitaria nenhum recálculo real.
  const value: ServiceProviderListContextValue = {
    ...query,
    handleClearFilters,
    selectedRecord: selection.selectedItem,
    handleOpenDeleteConfirmation: selection.selectItem,
    handleCloseDeleteConfirmation: selection.clearSelection,
    handleConfirmDelete,
    isDeletePending: deleteMutation.isPending,
    viewedRecord: viewSelection.selectedItem,
    handleOpenView: viewSelection.selectItem,
    handleCloseView: viewSelection.clearSelection,
  }

  return (
    <ServiceProviderListContext.Provider value={value}>
      {children}
    </ServiceProviderListContext.Provider>
  )
}
