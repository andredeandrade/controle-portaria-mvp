import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'
import { RegisterOccurrenceForm } from '@/modules/ocorrencias/components/RegisterOccurrenceForm'

export const metadata: Metadata = {
  title: 'Registrar Ocorrência',
}

export default function RegistrarOcorrenciaPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/ocorrencias"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Registrar ocorrência
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Registre o que aconteceu, quando e onde, para que o histórico da portaria fique completo.
        </Typography>
      </Stack>

      <RegisterOccurrenceForm />
    </Stack>
  )
}
