'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import {
  mapOccurrenceFormValuesToPayload,
  OccurrenceForm,
  type OccurrenceFormValues,
} from '@/modules/ocorrencias/components/OccurrenceForm'
import { useOccurrence } from '@/modules/ocorrencias/hooks/useOccurrence'
import { useUpdateOccurrence } from '@/modules/ocorrencias/hooks/useUpdateOccurrence'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'
import type { OccurrenceTypeEnum } from '@/types/ocorrencias'

type EditOccurrenceFormProps = {
  occurrenceId: string
}

export function EditOccurrenceForm({ occurrenceId }: EditOccurrenceFormProps) {
  const router = useRouter()
  const { occurrence, isLoading, isError, errorMessage, refetch } = useOccurrence(occurrenceId)
  const updateOccurrenceMutation = useUpdateOccurrence(occurrenceId)
  const { showError, showSuccess } = useAppSnackbar()

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !occurrence) {
    return (
      <ListErrorState
        title="Não foi possível carregar a ocorrência."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const defaultValues: OccurrenceFormValues = {
    occurrenceType: occurrence.occurrenceType as OccurrenceTypeEnum,
    date: occurrence.date,
    time: occurrence.time,
    place: occurrence.place ?? '',
    report: occurrence.report,
  }

  const onSubmit = async (values: OccurrenceFormValues) => {
    try {
      await updateOccurrenceMutation.mutateAsync(mapOccurrenceFormValuesToPayload(values))

      showSuccess('Ocorrência atualizada com sucesso.')
      router.push('/ocorrencias')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível atualizar a ocorrência.')
    }
  }

  return (
    <OccurrenceForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateOccurrenceMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/ocorrencias')}
    />
  )
}
