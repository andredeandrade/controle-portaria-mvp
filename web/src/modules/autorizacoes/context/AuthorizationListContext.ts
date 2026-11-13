'use client'

import { createContext, useContext } from 'react'

import type { useAuthorizations } from '@/modules/autorizacoes/hooks/useAuthorizations'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { AuthorizationRecord } from '@/types/autorizacoes'

type AuthorizationListQueryState = ReturnType<typeof useAuthorizations>
type AuthorizationListSelectionState = ReturnType<typeof useListSelection<AuthorizationRecord>>

export type AuthorizationListContextValue = AuthorizationListQueryState & {
  handleClearFilters: () => void
  selectedRecord: AuthorizationListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: AuthorizationListSelectionState['selectItem']
  handleCloseDeleteConfirmation: AuthorizationListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
  viewedRecord: AuthorizationListSelectionState['selectedItem']
  handleOpenView: AuthorizationListSelectionState['selectItem']
  handleCloseView: AuthorizationListSelectionState['clearSelection']
}

export const AuthorizationListContext = createContext<AuthorizationListContextValue | null>(null)

export function useAuthorizationListContext() {
  const context = useContext(AuthorizationListContext)

  if (!context) {
    throw new Error(
      'useAuthorizationListContext deve ser usado dentro de AuthorizationListProvider.',
    )
  }

  return context
}
