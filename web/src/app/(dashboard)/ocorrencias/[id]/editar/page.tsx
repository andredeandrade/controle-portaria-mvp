import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { EditOccurrenceForm } from '@/modules/ocorrencias/components/EditOccurrenceForm'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'

export const metadata: Metadata = {
  title: 'Editar Ocorrência',
}

export default async function EditarOcorrenciaPage({
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
            fallbackHref="/ocorrencias"
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Editar ocorrência
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Atualize os dados da ocorrência para manter o histórico da portaria completo.
        </Typography>
      </Stack>

      <EditOccurrenceForm occurrenceId={id} />
    </Stack>
  )
}
