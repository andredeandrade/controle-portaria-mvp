'use client'

import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function VisitorsListSearch() {
  const { searchTerm, handleSearchChange } = useVisitorListContext()

  return (
    <ListSearchField
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Buscar por nome, CPF, telefone ou placa..."
      fullWidth
      sx={{
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  )
}
