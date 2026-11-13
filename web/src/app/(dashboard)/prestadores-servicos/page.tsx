import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { RegisterServiceProviderButton } from '@/modules/prestadores-servicos/components/RegisterServiceProviderButton'
import { ServiceProvidersList } from '@/modules/prestadores-servicos/components/ServiceProvidersList'
import { Box } from '@mui/material'

export const metadata: Metadata = {
  title: 'Prestadores de Serviços',
}

export default function PrestadoresServicosPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="h2" fontWeight={700} color="text.primary">
            Prestadores de Serviços
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '4px' }}>
            Consulte os prestadores cadastrados, a empresa responsável e a unidade atendida.
          </Typography>
        </Box>

        <Stack
          direction="row"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <RegisterServiceProviderButton sx={{ width: { xs: '100%', sm: 'auto' } }} />
        </Stack>
      </Stack>

      <ServiceProvidersList />
    </Stack>
  )
}
