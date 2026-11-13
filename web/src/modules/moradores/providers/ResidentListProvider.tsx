'use client'

import type { ReactNode } from 'react'

import {
  ResidentListContext,
  type ResidentListContextValue,
} from '@/modules/moradores/context/ResidentListContext'
import { useDeleteResident } from '@/modules/moradores/hooks/useDeleteResident'
import { useResidents } from '@/modules/moradores/hooks/useResidents'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { ResidentRecord } from '@/types/moradores'

type ResidentListProviderProps = {
  children: ReactNode
}

export function ResidentListProvider({ children }: ResidentListProviderProps) {
  const query = useResidents()
  const selection = useListSelection<ResidentRecord>()
  const viewSelection = useListSelection<ResidentRecord>()
  const deleteMutation = useDeleteResident()

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
  const value: ResidentListContextValue = {
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

  return <ResidentListContext.Provider value={value}>{children}</ResidentListContext.Provider>
}
