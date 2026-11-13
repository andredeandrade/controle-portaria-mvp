'use client'

import type { ReactNode } from 'react'

import {
  VisitorListContext,
  type VisitorListContextValue,
} from '@/modules/visitantes/context/VisitorListContext'
import { useDeleteVisitor } from '@/modules/visitantes/hooks/useDeleteVisitor'
import { useVisitors } from '@/modules/visitantes/hooks/useVisitors'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { VisitorRecord } from '@/types/visitantes'

type VisitorListProviderProps = {
  children: ReactNode
}

export function VisitorListProvider({ children }: VisitorListProviderProps) {
  const query = useVisitors()
  const selection = useListSelection<VisitorRecord>()
  const viewSelection = useListSelection<VisitorRecord>()
  const deleteMutation = useDeleteVisitor()

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
  const value: VisitorListContextValue = {
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

  return <VisitorListContext.Provider value={value}>{children}</VisitorListContext.Provider>
}
