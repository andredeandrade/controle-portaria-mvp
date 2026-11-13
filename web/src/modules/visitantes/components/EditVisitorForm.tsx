'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import {
  mapVisitorFormValuesToPayload,
  VisitorForm,
  type VisitorFormValues,
} from '@/modules/visitantes/components/VisitorForm'
import { useUpdateVisitor } from '@/modules/visitantes/hooks/useUpdateVisitor'
import { useVisitor } from '@/modules/visitantes/hooks/useVisitor'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type EditVisitorFormProps = {
  visitorId: string
}

export function EditVisitorForm({ visitorId }: EditVisitorFormProps) {
  const router = useRouter()
  const { visitor, isLoading, isError, errorMessage, refetch } = useVisitor(visitorId)
  const updateVisitorMutation = useUpdateVisitor(visitorId)
  const { showError, showSuccess } = useAppSnackbar()

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !visitor) {
    return (
      <ListErrorState
        title="Não foi possível carregar o visitante."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const defaultValues: VisitorFormValues = {
    fullName: visitor.fullName,
    document: visitor.document ?? '',
    phone: visitor.phone ?? '',
    email: visitor.email ?? '',
    unit: visitor.unit,
    authorizedBy: visitor.authorizedBy,
    vehiclePlate: visitor.vehiclePlate ?? '',
    vehicleBrandModel: visitor.vehicleBrandModel ?? '',
    vehicleColor: visitor.vehicleColor ?? '',
    observations: visitor.observations ?? '',
  }

  const onSubmit = async (values: VisitorFormValues) => {
    try {
      await updateVisitorMutation.mutateAsync(mapVisitorFormValuesToPayload(values))

      showSuccess('Visitante atualizado com sucesso.')
      router.push('/visitantes')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível atualizar o visitante.')
    }
  }

  return (
    <VisitorForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateVisitorMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/visitantes')}
    />
  )
}
