'use client'

import { createContext, useContext } from 'react'

import type { useEvents } from '@/modules/eventos/hooks/useEvents'
import type { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { EventRecord } from '@/types/eventos'

type EventListQueryState = ReturnType<typeof useEvents>
type EventListSelectionState = ReturnType<typeof useListSelection<EventRecord>>

export type EventListContextValue = EventListQueryState & {
  handleClearFilters: () => void
  selectedRecord: EventListSelectionState['selectedItem']
  handleOpenDeleteConfirmation: EventListSelectionState['selectItem']
  handleCloseDeleteConfirmation: EventListSelectionState['clearSelection']
  handleConfirmDelete: () => Promise<void>
  isDeletePending: boolean
}

export const EventListContext = createContext<EventListContextValue | null>(null)

export function useEventListContext() {
  const context = useContext(EventListContext)

  if (!context) {
    throw new Error('useEventListContext deve ser usado dentro de EventListProvider.')
  }

  return context
}
