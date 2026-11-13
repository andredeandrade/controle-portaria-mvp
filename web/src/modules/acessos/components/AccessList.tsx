'use client'

import { AccessListContent } from '@/modules/acessos/components/AccessListContent'
import { AccessListProvider } from '@/modules/acessos/providers/AccessListProvider'

export function AccessList() {
  return (
    <AccessListProvider>
      <AccessListContent />
    </AccessListProvider>
  )
}
