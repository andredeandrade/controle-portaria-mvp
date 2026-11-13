import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'
import { RegisterVisitorForm } from '@/modules/visitantes/components/RegisterVisitorForm'

export const metadata: Metadata = {
  title: 'Cadastrar Visitante',
}

export default function CadastrarVisitantePage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/visitantes"
          />
          <Typography variant="h2" fontWeight={700} color="text.primary">
            Cadastrar visitante
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Informe os dados do visitante e quem autorizou a entrada na unidade.
        </Typography>
      </Stack>

      <RegisterVisitorForm />
    </Stack>
  )
}
