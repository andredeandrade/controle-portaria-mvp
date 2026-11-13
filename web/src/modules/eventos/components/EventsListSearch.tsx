'use client'

import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function EventsListSearch() {
  const { searchTerm, handleSearchChange } = useEventListContext()

  return (
    <ListSearchField
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Buscar por evento, responsável ou unidade..."
      fullWidth
      sx={{
        maxWidth: { xs: '100%', sm: 420 },
      }}
    />
  )
}
