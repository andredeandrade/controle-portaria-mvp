'use client'

import { createContext, useContext } from 'react'

import type { useServiceProviders } from '@/modules/prestadores-servicos/hooks/useServiceProviders'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { ServiceProviderRecord } from '@/types/prestadores-servicos'

type ServiceProviderListQueryState = ReturnType<typeof useServiceProviders>
type ServiceProviderListSelectionState = ReturnType<typeof useListSelection<ServiceProviderRecord>>

export type ServiceProviderListContextValue = ServiceProviderListQueryState & {
  handleClearFilters: () => void
  selectedRecord: ServiceProviderListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: ServiceProviderListSelectionState['selectItem']
  handleCloseDeleteConfirmation: ServiceProviderListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
  viewedRecord: ServiceProviderListSelectionState['selectedItem']
  handleOpenView: ServiceProviderListSelectionState['selectItem']
  handleCloseView: ServiceProviderListSelectionState['clearSelection']
}

export const ServiceProviderListContext = createContext<ServiceProviderListContextValue | null>(
  null,
)

export function useServiceProviderListContext() {
  const context = useContext(ServiceProviderListContext)

  if (!context) {
    throw new Error(
      'useServiceProviderListContext deve ser usado dentro de ServiceProviderListProvider.',
    )
  }

  return context
}
