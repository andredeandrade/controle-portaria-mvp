'use client'

import { useRouter } from 'next/navigation'

import {
  mapOccurrenceFormValuesToPayload,
  OccurrenceForm,
  type OccurrenceFormValues,
} from '@/modules/ocorrencias/components/OccurrenceForm'
import { useCreateOccurrence } from '@/modules/ocorrencias/hooks/useCreateOccurrence'
import { useAppSnackbar } from '@/providers'

export function RegisterOccurrenceForm() {
  const router = useRouter()
  const createOccurrenceMutation = useCreateOccurrence()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: OccurrenceFormValues) => {
    try {
      await createOccurrenceMutation.mutateAsync(mapOccurrenceFormValuesToPayload(values))

      showSuccess('Ocorrência registrada com sucesso.')
      router.push('/ocorrencias')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível registrar a ocorrência.')
    }
  }

  return (
    <OccurrenceForm
      submitLabel="Salvar registro"
      isSubmitting={createOccurrenceMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/ocorrencias')}
    />
  )
}
