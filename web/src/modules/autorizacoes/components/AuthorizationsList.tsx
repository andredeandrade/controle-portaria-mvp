'use client'

import { AuthorizationsListContent } from '@/modules/autorizacoes/components/AuthorizationsListContent'
import { AuthorizationListProvider } from '@/modules/autorizacoes/providers/AuthorizationListProvider'

export function AuthorizationsList() {
  return (
    <AuthorizationListProvider>
      <AuthorizationsListContent />
    </AuthorizationListProvider>
  )
}
