'use client'

import { AccessListProvider } from '@/modules/acessos/providers/AccessListProvider'
import { DashboardRecentAccessesContent } from '@/modules/dashboard/components/DashboardRecentAccessesContent'

export function DashboardRecentAccesses() {
  return (
    <AccessListProvider>
      <DashboardRecentAccessesContent />
    </AccessListProvider>
  )
}
