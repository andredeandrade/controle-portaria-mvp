'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { EventDeleteConfirmationDialog } from '@/modules/eventos/components/EventDeleteConfirmationDialog'
import { EventsListPagination } from '@/modules/eventos/components/EventsListPagination'
import { EventsListSearch } from '@/modules/eventos/components/EventsListSearch'
import { EventsTable } from '@/modules/eventos/components/EventsTable'
import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { EventsMobileList } from '@/modules/eventos/mobile/EventsMobileList'

export function EventsListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useEventListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <EventsListSearch />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} eventos encontrados
        </Typography>

        {isMobile ? <EventsMobileList /> : <EventsTable />}

        <EventsListPagination />
      </Stack>

      <EventDeleteConfirmationDialog />
    </>
  )
}
