'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { AuthorizationDetailsDialog } from '@/modules/autorizacoes/components/AuthorizationDetailsDialog'
import { AuthorizationRevokeConfirmationDialog } from '@/modules/autorizacoes/components/AuthorizationRevokeConfirmationDialog'
import { AuthorizationsListPagination } from '@/modules/autorizacoes/components/AuthorizationsListPagination'
import { AuthorizationsListSearch } from '@/modules/autorizacoes/components/AuthorizationsListSearch'
import { AuthorizationsTable } from '@/modules/autorizacoes/components/AuthorizationsTable'
import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { AuthorizationsMobileList } from '@/modules/autorizacoes/mobile/AuthorizationsMobileList'

export function AuthorizationsListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useAuthorizationListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <AuthorizationsListSearch />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} autorizações encontradas
        </Typography>

        {isMobile ? <AuthorizationsMobileList /> : <AuthorizationsTable />}

        <AuthorizationsListPagination />
      </Stack>

      <AuthorizationRevokeConfirmationDialog />
      <AuthorizationDetailsDialog />
    </>
  )
}
