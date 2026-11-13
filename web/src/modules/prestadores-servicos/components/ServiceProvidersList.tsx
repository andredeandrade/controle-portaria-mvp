'use client'

import { ServiceProvidersListContent } from '@/modules/prestadores-servicos/components/ServiceProvidersListContent'
import { ServiceProviderListProvider } from '@/modules/prestadores-servicos/providers/ServiceProviderListProvider'

export function ServiceProvidersList() {
  return (
    <ServiceProviderListProvider>
      <ServiceProvidersListContent />
    </ServiceProviderListProvider>
  )
}
