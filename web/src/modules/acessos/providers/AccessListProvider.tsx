'use client'

import { useState, type ReactNode } from 'react'

import { useCan } from '@/hooks/useCan'
import {
  AccessListContext,
  type AccessListContextValue,
} from '@/modules/acessos/context/AccessListContext'
import { type AccessRecord, useAccessList } from '@/modules/acessos/hooks/useAccessList'
import { useCheckOutAccessRecord } from '@/modules/acessos/hooks/useCheckOutAccessRecord'
import { useListSelection } from '@/modules/table/hooks/useListSelection'
import type { AccessListViewMode } from '@/types/acessos'

type AccessListProviderProps = {
  initialViewMode?: AccessListViewMode
  children: ReactNode
}

export function AccessListProvider({
  initialViewMode = 'all',
  children,
}: AccessListProviderProps) {
  const [viewMode, setViewMode] = useState<AccessListViewMode>(initialViewMode)
  const query = useAccessList({ viewMode })
  const selection = useListSelection<AccessRecord>()
  const checkOutMutation = useCheckOutAccessRecord()

  const canCheckOut = useCan('access-records', 'checkOut')
  const showExitActions = canCheckOut

  const handleViewModeChange = (nextViewMode: AccessListViewMode) => {
    query.handlePageChange(1)
    setViewMode(nextViewMode)
  }

  const handleClearFilters = () => {
    query.handleSearchChange('')
    handleViewModeChange('all')
  }

  const handleConfirmExit = async (personIds?: string[], observations?: string) => {
    if (!selection.selectedItem) {
      return
    }

    await checkOutMutation.mutateAsync({
      id: selection.selectedItem.id,
      personIds,
      observations,
    })
  }

  // O value não é memoizado propositalmente: records/isFetching mudam a cada
  // fetch e os handlers vêm de hooks que já recriam suas referências a cada
  // render, então um useMemo aqui não evitaria nenhum recálculo real.
  const value: AccessListContextValue = {
    ...query,
    viewMode,
    setViewMode: handleViewModeChange,
    showExitActions,
    selectedRecord: selection.selectedItem,
    handleOpenExitConfirmation: selection.selectItem,
    handleCloseExitConfirmation: selection.clearSelection,
    handleConfirmExit,
    isCheckOutPending: checkOutMutation.isPending,
    checkOutErrorMessage: checkOutMutation.isError ? checkOutMutation.error.message : null,
    handleClearFilters,
  }

  return <AccessListContext.Provider value={value}>{children}</AccessListContext.Provider>
}
