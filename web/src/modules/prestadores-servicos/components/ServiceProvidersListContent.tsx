'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { ServiceProviderDeleteConfirmationDialog } from '@/modules/prestadores-servicos/components/ServiceProviderDeleteConfirmationDialog'
import { ServiceProviderDetailsDialog } from '@/modules/prestadores-servicos/components/ServiceProviderDetailsDialog'
import { ServiceProvidersListPagination } from '@/modules/prestadores-servicos/components/ServiceProvidersListPagination'
import { ServiceProvidersListSearch } from '@/modules/prestadores-servicos/components/ServiceProvidersListSearch'
import { ServiceProvidersTable } from '@/modules/prestadores-servicos/components/ServiceProvidersTable'
import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { ServiceProvidersMobileList } from '@/modules/prestadores-servicos/mobile/ServiceProvidersMobileList'

export function ServiceProvidersListContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { pagination } = useServiceProviderListContext()

  return (
    <>
      <Stack spacing={{ xs: 4, sm: 5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 2.5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ px: { xs: 0.5, sm: 1 } }}
        >
          <ServiceProvidersListSearch />
        </Stack>

        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontSize: '0.8125rem', px: { xs: 0.5, sm: 1 } }}
        >
          {pagination.total} prestadores encontrados
        </Typography>

        {isMobile ? <ServiceProvidersMobileList /> : <ServiceProvidersTable />}

        <ServiceProvidersListPagination />
      </Stack>

      <ServiceProviderDeleteConfirmationDialog />
      <ServiceProviderDetailsDialog />
    </>
  )
}
