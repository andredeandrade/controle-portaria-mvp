'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { OccurrenceDeleteConfirmationDialog } from '@/modules/ocorrencias/components/OccurrenceDeleteConfirmationDialog'
import { OccurrenceDetailsDialog } from '@/modules/ocorrencias/components/OccurrenceDetailsDialog'
import { OccurrencesTable } from '@/modules/ocorrencias/components/OccurrencesTable'
import { useOccurrenceListContext } from '@/modules/ocorrencias/context/OccurrenceListContext'
import { OccurrencesMobileList } from '@/modules/ocorrencias/mobile/OccurrencesMobileList'
import { ListPagination } from '@/modules/table/components/ListPagination'
import { ListSearchField } from '@/modules/table/components/ListSearchField'

export function OccurrencesListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { searchTerm, handleSearchChange, pagination, handlePageChange, isLoading, isFetching } =
    useOccurrenceListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <ListSearchField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por tipo, data, hora ou local..."
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 420 } }}
          />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} ocorrências encontradas
        </Typography>

        {isMobile ? <OccurrencesMobileList /> : <OccurrencesTable />}

        <ListPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          disabled={isLoading || isFetching}
        />
      </Stack>

      <OccurrenceDeleteConfirmationDialog />
      <OccurrenceDetailsDialog />
    </>
  )
}
