'use client'

import { createContext, useContext } from 'react'

import type { useResidents } from '@/modules/moradores/hooks/useResidents'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { ResidentRecord } from '@/types/moradores'

type ResidentListQueryState = ReturnType<typeof useResidents>
type ResidentListSelectionState = ReturnType<typeof useListSelection<ResidentRecord>>

export type ResidentListContextValue = ResidentListQueryState & {
  handleClearFilters: () => void
  selectedRecord: ResidentListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: ResidentListSelectionState['selectItem']
  handleCloseDeleteConfirmation: ResidentListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
  viewedRecord: ResidentListSelectionState['selectedItem']
  handleOpenView: ResidentListSelectionState['selectItem']
  handleCloseView: ResidentListSelectionState['clearSelection']
}

export const ResidentListContext = createContext<ResidentListContextValue | null>(null)

export function useResidentListContext() {
  const context = useContext(ResidentListContext)

  if (!context) {
    throw new Error('useResidentListContext deve ser usado dentro de ResidentListProvider.')
  }

  return context
}
