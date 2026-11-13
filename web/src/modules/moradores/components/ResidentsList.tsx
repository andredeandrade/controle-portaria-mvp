'use client'

import { ResidentsListContent } from '@/modules/moradores/components/ResidentsListContent'
import { ResidentListProvider } from '@/modules/moradores/providers/ResidentListProvider'

export function ResidentsList() {
  return (
    <ResidentListProvider>
      <ResidentsListContent />
    </ResidentListProvider>
  )
}
