'use client'

import { createContext, useContext } from 'react'

import type { useOccurrences } from '@/modules/ocorrencias/hooks/useOccurrences'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { OccurrenceRecord } from '@/types/ocorrencias'

type OccurrenceListQueryState = ReturnType<typeof useOccurrences>
type OccurrenceListSelectionState = ReturnType<typeof useListSelection<OccurrenceRecord>>

export type OccurrenceListContextValue = OccurrenceListQueryState & {
  handleClearFilters: () => void
  selectedRecord: OccurrenceListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: OccurrenceListSelectionState['selectItem']
  handleCloseDeleteConfirmation: OccurrenceListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
  viewedRecord: OccurrenceListSelectionState['selectedItem']
  handleOpenView: OccurrenceListSelectionState['selectItem']
  handleCloseView: OccurrenceListSelectionState['clearSelection']
}

export const OccurrenceListContext = createContext<OccurrenceListContextValue | null>(null)

export function useOccurrenceListContext() {
  const context = useContext(OccurrenceListContext)

  if (!context) {
    throw new Error('useOccurrenceListContext deve ser usado dentro de OccurrenceListProvider.')
  }

  return context
}
