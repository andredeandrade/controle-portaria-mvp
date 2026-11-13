'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import type { ColorValue } from '@/modules/form'
import {
  mapResidentFormValuesToPayload,
  ResidentForm,
  type ResidentFormValues,
} from '@/modules/moradores/components/ResidentForm'
import { useResident } from '@/modules/moradores/hooks/useResident'
import { useUpdateResident } from '@/modules/moradores/hooks/useUpdateResident'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type EditResidentFormProps = {
  residentId: string
}

export function EditResidentForm({ residentId }: EditResidentFormProps) {
  const router = useRouter()
  const { resident, isLoading, isError, errorMessage, refetch } = useResident(residentId)
  const updateResidentMutation = useUpdateResident(residentId)
  const { showError, showSuccess } = useAppSnackbar()

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !resident) {
    return (
      <ListErrorState
        title="Não foi possível carregar o morador."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const defaultValues: ResidentFormValues = {
    fullName: resident.fullName,
    document: resident.document ?? '',
    phone: resident.phone ?? '',
    email: resident.email ?? '',
    units:
      resident.units.length > 0 ? resident.units.map((unit) => ({ value: unit })) : [{ value: '' }],
    relation: resident.relation,
    observations: resident.observations ?? '',
    vehicles:
      resident.vehicles.length === 0
        ? [{ type: '', color: '', plate: '', brandModel: '' }]
        : resident.vehicles.map((vehicle) => ({
            type: vehicle.type,
            color: (vehicle.color ?? '') as ColorValue | '',
            plate: vehicle.plate ?? '',
            brandModel: vehicle.brandModel ?? '',
          })),
  }

  const onSubmit = async (values: ResidentFormValues) => {
    try {
      await updateResidentMutation.mutateAsync(mapResidentFormValuesToPayload(values))

      showSuccess('Morador atualizado com sucesso.')
      router.push('/moradores')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível atualizar o morador.')
    }
  }

  return (
    <ResidentForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateResidentMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/moradores')}
    />
  )
}
