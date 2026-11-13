import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { OccurrencesList } from '@/modules/ocorrencias/components/OccurrencesList'
import { RegisterOccurrenceButton } from '@/modules/ocorrencias/components/RegisterOccurrenceButton'

export const metadata: Metadata = {
  title: 'Ocorrências',
}

export default function OcorrenciasPage() {
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
            Ocorrências
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: '4px' }}>
            Histórico de ocorrências registradas pela portaria.
          </Typography>
        </Box>

        <Stack
          direction="row"
          justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <RegisterOccurrenceButton sx={{ width: { xs: '100%', sm: 'auto' } }} />
        </Stack>
      </Stack>

      <OccurrencesList />
    </Stack>
  )
}
