import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { EditServiceProviderForm } from '@/modules/prestadores-servicos/components/EditServiceProviderForm'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'

export const metadata: Metadata = {
  title: 'Editar Prestador de Serviço',
}

export default async function EditarPrestadorServicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref="/prestadores-servicos"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Editar prestador de serviço
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Atualize os dados do prestador, a empresa responsável e a unidade atendida.
        </Typography>
      </Stack>

      <EditServiceProviderForm serviceProviderId={id} />
    </Stack>
  )
}
