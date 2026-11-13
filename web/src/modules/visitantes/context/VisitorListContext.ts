'use client'

import { createContext, useContext } from 'react'

import type { useVisitors } from '@/modules/visitantes/hooks/useVisitors'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { VisitorRecord } from '@/types/visitantes'

type VisitorListQueryState = ReturnType<typeof useVisitors>
type VisitorListSelectionState = ReturnType<typeof useListSelection<VisitorRecord>>

export type VisitorListContextValue = VisitorListQueryState & {
  handleClearFilters: () => void
  selectedRecord: VisitorListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: VisitorListSelectionState['selectItem']
  handleCloseDeleteConfirmation: VisitorListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
  viewedRecord: VisitorListSelectionState['selectedItem']
  handleOpenView: VisitorListSelectionState['selectItem']
  handleCloseView: VisitorListSelectionState['clearSelection']
}

export const VisitorListContext = createContext<VisitorListContextValue | null>(null)

export function useVisitorListContext() {
  const context = useContext(VisitorListContext)

  if (!context) {
    throw new Error('useVisitorListContext deve ser usado dentro de VisitorListProvider.')
  }

  return context
}
