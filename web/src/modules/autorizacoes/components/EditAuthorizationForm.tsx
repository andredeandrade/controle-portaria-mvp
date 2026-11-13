'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import {
  AuthorizationForm,
  mapAuthorizationFormValuesToPayload,
  type AuthorizationFormValues,
} from '@/modules/autorizacoes/components/AuthorizationForm'
import { useAuthorization } from '@/modules/autorizacoes/hooks/useAuthorization'
import { useUpdateAuthorization } from '@/modules/autorizacoes/hooks/useUpdateAuthorization'
import type { PersonTypeValue } from '@/modules/form/components/PersonTypeSelect'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type EditAuthorizationFormProps = {
  authorizationId: string
}

export function EditAuthorizationForm({ authorizationId }: EditAuthorizationFormProps) {
  const router = useRouter()
  const { authorization, isLoading, isError, errorMessage, refetch } =
    useAuthorization(authorizationId)
  const updateAuthorizationMutation = useUpdateAuthorization(authorizationId)
  const { showError, showSuccess } = useAppSnackbar()

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !authorization) {
    return (
      <ListErrorState
        title="Não foi possível carregar a autorização."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const defaultValues: AuthorizationFormValues = {
    authorizedName: authorization.authorizedName,
    personType: authorization.personType as PersonTypeValue,
    document: authorization.document,
    phone: authorization.phone ?? '',
    company: authorization.company ?? '',
    unit: authorization.unit,
    authorizedBy: authorization.authorizedBy,
    validFromDate: authorization.validFromDate,
    validFromTime: authorization.validFromTime,
    validToDate: authorization.validToDate,
    validToTime: authorization.validToTime,
    observations: authorization.observations ?? '',
  }

  const onSubmit = async (values: AuthorizationFormValues) => {
    try {
      await updateAuthorizationMutation.mutateAsync(mapAuthorizationFormValuesToPayload(values))

      showSuccess('Autorização atualizada com sucesso.')
      router.push('/autorizacoes')
      router.refresh()
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Não foi possível atualizar a autorização.',
      )
    }
  }

  return (
    <AuthorizationForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateAuthorizationMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/autorizacoes')}
    />
  )
}
