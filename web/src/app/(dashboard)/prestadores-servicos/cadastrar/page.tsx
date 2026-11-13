import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'
import { RegisterServiceProviderForm } from '@/modules/prestadores-servicos/components/RegisterServiceProviderForm'

export const metadata: Metadata = {
  title: 'Cadastrar Prestador de Serviços',
}

export default function CadastrarPrestadorServicosPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/prestadores-servicos"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Adicionar prestador de serviço
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Informe os dados do prestador, a empresa responsável e a unidade atendida.
        </Typography>
      </Stack>

      <RegisterServiceProviderForm />
    </Stack>
  )
}
