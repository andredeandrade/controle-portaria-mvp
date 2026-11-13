'use client'

import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function ServiceProvidersListSearch() {
  const { searchTerm, handleSearchChange } = useServiceProviderListContext()

  return (
    <ListSearchField
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Buscar por nome, CPF, empresa ou placa..."
      fullWidth
      sx={{
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  )
}
