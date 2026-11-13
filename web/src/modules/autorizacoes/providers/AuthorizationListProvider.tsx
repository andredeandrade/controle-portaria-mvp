'use client'

import type { ReactNode } from 'react'

import {
  AuthorizationListContext,
  type AuthorizationListContextValue,
} from '@/modules/autorizacoes/context/AuthorizationListContext'
import { useAuthorizations } from '@/modules/autorizacoes/hooks/useAuthorizations'
import { useDeleteAuthorization } from '@/modules/autorizacoes/hooks/useDeleteAuthorization'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { AuthorizationRecord } from '@/types/autorizacoes'

type AuthorizationListProviderProps = {
  children: ReactNode
}

export function AuthorizationListProvider({ children }: AuthorizationListProviderProps) {
  const query = useAuthorizations()
  const selection = useListSelection<AuthorizationRecord>()
  const viewSelection = useListSelection<AuthorizationRecord>()
  const deleteMutation = useDeleteAuthorization()

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
  const value: AuthorizationListContextValue = {
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
    <AuthorizationListContext.Provider value={value}>{children}</AuthorizationListContext.Provider>
  )
}
