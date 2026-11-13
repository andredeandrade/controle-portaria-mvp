import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { AuthorizationsList } from '@/modules/autorizacoes/components/AuthorizationsList'
import { RegisterAuthorizationButton } from '@/modules/autorizacoes/components/RegisterAuthorizationButton'

export const metadata: Metadata = {
  title: 'Autorizações',
}

export default function AutorizacoesPage() {
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
            Autorizações
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '4px' }}>
            Pessoas autorizadas a entrar no condomínio, com período de validade e responsável pela
            autorização.
          </Typography>
        </Box>

        <Stack
          direction="row"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <RegisterAuthorizationButton sx={{ width: { xs: '100%', sm: 'auto' } }} />
        </Stack>
      </Stack>

      <AuthorizationsList />
    </Stack>
  )
}
