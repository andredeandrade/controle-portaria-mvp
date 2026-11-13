'use client'

import { useRouter } from 'next/navigation'

import {
  AuthorizationForm,
  mapAuthorizationFormValuesToPayload,
  type AuthorizationFormValues,
} from '@/modules/autorizacoes/components/AuthorizationForm'
import { useCreateAuthorization } from '@/modules/autorizacoes/hooks/useCreateAuthorization'
import { useAppSnackbar } from '@/providers'

export function RegisterAuthorizationForm() {
  const router = useRouter()
  const createAuthorizationMutation = useCreateAuthorization()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: AuthorizationFormValues) => {
    try {
      await createAuthorizationMutation.mutateAsync(mapAuthorizationFormValuesToPayload(values))

      showSuccess('Autorização registrada com sucesso.')
      router.push('/autorizacoes')
      router.refresh()
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Não foi possível registrar a autorização.',
      )
    }
  }

  const handleCancel = () => router.push('/autorizacoes')

  return (
    <AuthorizationForm
      submitLabel="Salvar autorização"
      isSubmitting={createAuthorizationMutation.isPending}
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  )
}
