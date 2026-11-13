'use client'

import { createContext, useContext } from 'react'

import type { AccessRecord, useAccessList } from '@/modules/acessos/hooks/useAccessList'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { AccessListViewMode } from '@/types/acessos'

type AccessListQueryState = ReturnType<typeof useAccessList>
type AccessListSelectionState = ReturnType<typeof useListSelection<AccessRecord>>

export type AccessListContextValue = AccessListQueryState & {
  viewMode: AccessListViewMode
  setViewMode: (viewMode: AccessListViewMode) => void
  showExitActions: boolean
  selectedRecord: AccessListSelectionState['selectedItem']
  handleOpenExitConfirmation: AccessListSelectionState['selectItem']
  handleCloseExitConfirmation: AccessListSelectionState['clearSelection']
  handleConfirmExit: (personIds?: string[], observations?: string) => Promise<void>
  isCheckOutPending: boolean
  checkOutErrorMessage: string | null
  handleClearFilters: () => void
}

export const AccessListContext = createContext<AccessListContextValue | null>(null)

export function useAccessListContext() {
  const context = useContext(AccessListContext)

  if (!context) {
    throw new Error('useAccessListContext deve ser usado dentro de AccessListProvider.')
  }

  return context
}
