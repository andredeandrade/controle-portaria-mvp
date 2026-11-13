'use client'

import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function ResidentsListSearch() {
  const { searchTerm, handleSearchChange } = useResidentListContext()

  return (
    <ListSearchField
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Buscar por nome, CPF, unidade ou placa..."
      fullWidth
      sx={{
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  )
}
