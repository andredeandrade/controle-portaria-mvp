import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { AccessRegisterForm } from '@/modules/acessos/components/AccessRegisterForm'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'

export const metadata: Metadata = {
  title: 'Registrar Acesso',
}

export default function AcessoRegistrarPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }} sx={{ width: '100%', maxWidth: 880 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/acessos"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Registrar Acesso
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Identifique a categoria e busque o cadastro para preencher automaticamente.
        </Typography>
      </Stack>

      <AccessRegisterForm />
    </Stack>
  )
}
