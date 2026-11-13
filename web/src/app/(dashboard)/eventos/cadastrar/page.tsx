import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { RegisterEventForm } from '@/modules/eventos/components/RegisterEventForm'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'

export const metadata: Metadata = {
  title: 'Registrar Evento',
}

export default function CadastrarEventoPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/eventos"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Registrar Evento
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Reserve o espaço, informe o responsável e cadastre a lista de convidados que a portaria
          vai liberar.
        </Typography>
      </Stack>

      <RegisterEventForm />
    </Stack>
  )
}
