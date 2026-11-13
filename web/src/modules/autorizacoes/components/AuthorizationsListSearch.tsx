'use client'

import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function AuthorizationsListSearch() {
  const { searchTerm, handleSearchChange } = useAuthorizationListContext()

  return (
    <ListSearchField
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Buscar por nome, documento, unidade ou responsável..."
      fullWidth
      sx={{
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  )
}
