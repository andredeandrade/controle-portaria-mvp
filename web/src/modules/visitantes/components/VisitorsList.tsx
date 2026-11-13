'use client'

import { VisitorsListContent } from '@/modules/visitantes/components/VisitorsListContent'
import { VisitorListProvider } from '@/modules/visitantes/providers/VisitorListProvider'

export function VisitorsList() {
  return (
    <VisitorListProvider>
      <VisitorsListContent />
    </VisitorListProvider>
  )
}
