'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { ResidentDeleteConfirmationDialog } from '@/modules/moradores/components/ResidentDeleteConfirmationDialog'
import { ResidentDetailsDialog } from '@/modules/moradores/components/ResidentDetailsDialog'
import { ResidentsListPagination } from '@/modules/moradores/components/ResidentsListPagination'
import { ResidentsListSearch } from '@/modules/moradores/components/ResidentsListSearch'
import { ResidentsTable } from '@/modules/moradores/components/ResidentsTable'
import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import { ResidentsMobileList } from '@/modules/moradores/mobile/ResidentsMobileList'

export function ResidentsListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useResidentListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <ResidentsListSearch />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} moradores encontrados
        </Typography>

        {isMobile ? <ResidentsMobileList /> : <ResidentsTable />}

        <ResidentsListPagination />
      </Stack>

      <ResidentDeleteConfirmationDialog />
      <ResidentDetailsDialog />
    </>
  )
}
