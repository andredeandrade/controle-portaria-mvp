'use client'

import { useRouter } from 'next/navigation'

import { mapResidentFormValuesToPayload, ResidentForm, type ResidentFormValues } from '@/modules/moradores/components/ResidentForm'
import { useCreateResident } from '@/modules/moradores/hooks/useCreateResident'
import { useAppSnackbar } from '@/providers'

export function RegisterResidentForm() {
  const router = useRouter()
  const createResidentMutation = useCreateResident()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: ResidentFormValues) => {
    try {
      await createResidentMutation.mutateAsync(mapResidentFormValuesToPayload(values))

      showSuccess('Morador registrado com sucesso.')
      router.push('/moradores')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Nao foi possivel registrar o morador.')
    }
  }

  const handleCancel = () => router.push('/moradores')

  return (
    <ResidentForm
      submitLabel="Salvar registro"
      isSubmitting={createResidentMutation.isPending}
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  )
}
