'use client'

import type { ReactNode } from 'react'

import {
  OccurrenceListContext,
  type OccurrenceListContextValue,
} from '@/modules/ocorrencias/context/OccurrenceListContext'
import { useDeleteOccurrence } from '@/modules/ocorrencias/hooks/useDeleteOccurrence'
import { useOccurrences } from '@/modules/ocorrencias/hooks/useOccurrences'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { OccurrenceRecord } from '@/types/ocorrencias'

type OccurrenceListProviderProps = {
  children: ReactNode
}

export function OccurrenceListProvider({ children }: OccurrenceListProviderProps) {
  const query = useOccurrences()
  const selection = useListSelection<OccurrenceRecord>()
  const viewSelection = useListSelection<OccurrenceRecord>()
  const deleteMutation = useDeleteOccurrence()

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
  const value: OccurrenceListContextValue = {
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

  return <OccurrenceListContext.Provider value={value}>{children}</OccurrenceListContext.Provider>
}
