import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'
import { VisitorsList } from '@/modules/visitantes/components/VisitorsList'
import { RegisterVisitorButton } from '@/modules/visitantes/components/RegisterVisitorButton'
import { Box } from '@mui/material'

export const metadata: Metadata = {
  title: 'Visitantes',
}

export default function VisitantesPage() {
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
            Visitantes
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '4px' }}>
            Consulte os visitantes cadastrados, quem autorizou a entrada e os dados de contato.
          </Typography>
        </Box>

        <Stack
          direction="row"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <RegisterVisitorButton sx={{ width: { xs: '100%', sm: 'auto' } }} />
        </Stack>
      </Stack>

      <VisitorsList />
    </Stack>
  )
}
