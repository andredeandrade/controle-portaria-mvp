'use client'

import type { ReactNode } from 'react'

import { EventListContext, type EventListContextValue } from '@/modules/eventos/context/EventListContext'
import { useDeleteEvent } from '@/modules/eventos/hooks/useDeleteEvent'
import { useEvents } from '@/modules/eventos/hooks/useEvents'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { EventRecord } from '@/types/eventos'

type EventListProviderProps = {
  children: ReactNode
}

export function EventListProvider({ children }: EventListProviderProps) {
  const query = useEvents()
  const selection = useListSelection<EventRecord>()
  const deleteMutation = useDeleteEvent()

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
  const value: EventListContextValue = {
    ...query,
    handleClearFilters,
    selectedRecord: selection.selectedItem,
    handleOpenDeleteConfirmation: selection.selectItem,
    handleCloseDeleteConfirmation: selection.clearSelection,
    handleConfirmDelete,
    isDeletePending: deleteMutation.isPending,
  }

  return <EventListContext.Provider value={value}>{children}</EventListContext.Provider>
}
