'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { VisitorDeleteConfirmationDialog } from '@/modules/visitantes/components/VisitorDeleteConfirmationDialog'
import { VisitorDetailsDialog } from '@/modules/visitantes/components/VisitorDetailsDialog'
import { VisitorsListPagination } from '@/modules/visitantes/components/VisitorsListPagination'
import { VisitorsListSearch } from '@/modules/visitantes/components/VisitorsListSearch'
import { VisitorsTable } from '@/modules/visitantes/components/VisitorsTable'
import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
import { VisitorsMobileList } from '@/modules/visitantes/mobile/VisitorsMobileList'

export function VisitorsListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useVisitorListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <VisitorsListSearch />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} visitantes encontrados
        </Typography>

        {isMobile ? <VisitorsMobileList /> : <VisitorsTable />}

        <VisitorsListPagination />
      </Stack>

      <VisitorDeleteConfirmationDialog />
      <VisitorDetailsDialog />
    </>
  )
}
