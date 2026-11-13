import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { RegisterResidentForm } from '@/modules/moradores/components/RegisterResidentForm'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'

export const metadata: Metadata = {
  title: 'Cadastrar Morador',
}

export default function CadastrarMoradorPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/moradores"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Cadastrar morador
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Insira os dados do novo residente para registro no sistema de acesso.
        </Typography>
      </Stack>

      <RegisterResidentForm />
    </Stack>
  )
}
