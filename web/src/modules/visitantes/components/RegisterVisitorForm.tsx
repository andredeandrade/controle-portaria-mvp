'use client'

import { useRouter } from 'next/navigation'

import {
  mapVisitorFormValuesToPayload,
  VisitorForm,
  type VisitorFormValues,
} from '@/modules/visitantes/components/VisitorForm'
import { useCreateVisitor } from '@/modules/visitantes/hooks/useCreateVisitor'
import { useAppSnackbar } from '@/providers'

export function RegisterVisitorForm() {
  const router = useRouter()
  const createVisitorMutation = useCreateVisitor()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: VisitorFormValues) => {
    try {
      await createVisitorMutation.mutateAsync(mapVisitorFormValuesToPayload(values))

      showSuccess('Visitante registrado com sucesso.')
      router.push('/visitantes')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Nao foi possivel registrar o visitante.')
    }
  }

  const handleCancel = () => router.push('/visitantes')

  return (
    <VisitorForm
      submitLabel="Salvar Visitante"
      isSubmitting={createVisitorMutation.isPending}
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  )
}
