'use client'

import { OccurrencesListContent } from '@/modules/ocorrencias/components/OccurrencesListContent'
import { OccurrenceListProvider } from '@/modules/ocorrencias/providers/OccurrenceListProvider'

export function OccurrencesList() {
  return (
    <OccurrenceListProvider>
      <OccurrencesListContent />
    </OccurrenceListProvider>
  )
}
