'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { AccessExitRegistrationFeedback } from '@/modules/acessos/components/AccessExitRegistrationFeedback'
import { AccessListPagination } from '@/modules/acessos/components/AccessListPagination'
import { AccessListSearch } from '@/modules/acessos/components/AccessListSearch'
import { AccessListTable } from '@/modules/acessos/components/AccessListTable'
import { AccessListTableMobile } from '@/modules/acessos/mobile/AccessListTableMobile'
import { AccessListViewModeToggle } from '@/modules/acessos/components/AccessListViewModeToggle'
import { useAccessListContext } from '@/modules/acessos/context/AccessListContext'

export function AccessListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useAccessListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <AccessListSearch />
          <AccessListViewModeToggle />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} acessos encontrados
        </Typography>

        {isMobile ? <AccessListTableMobile /> : <AccessListTable />}

        <AccessListPagination />
      </Stack>

      <AccessExitRegistrationFeedback />
    </>
  )
}
